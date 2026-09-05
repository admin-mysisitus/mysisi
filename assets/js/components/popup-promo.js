import APIClient from '../modules/unified-api.js';
class PopupPromo {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'popup_promo_shown';
    this.storageTimeKey = `${this.storageKey}_time`;
    this.resetInterval = 3 * 60 * 60 * 1000;
    this.delay = options.delay || 10000;
    this.actionUrl = options.actionUrl || '#';
    this.actionTarget = options.actionTarget || '_self';
    this.onClose = options.onClose || null;
    this.onShow = options.onShow || null;
    this.overlay = null;
    this.container = null;
    this.isVisible = false;
    this.timeoutId = null;
    this.escKeyListener = null;
  }
  async init() {
    if (this.isAlreadyShown()) {
      return;
    }
    try {
      const promoRes = await APIClient.getPublicPromos();
      if (promoRes.success && promoRes.data && promoRes.data.length > 0) {
        this.schedulePopup();
      }
    } catch (e) {
      console.log('Error fetching promos for popup:', e);
    }
  }
  isAlreadyShown() {
    const timestamp = localStorage.getItem(this.storageTimeKey);
    if (!timestamp) return false;
    const currentTime = Date.now();
    const elapsedTime = currentTime - parseInt(timestamp);
    if (elapsedTime > this.resetInterval) {
      this.clearStorage();
      return false;
    }
    return true;
  }
  schedulePopup() {
    this.timeoutId = setTimeout(() => {
      this.show();
    }, this.delay);
  }
  show() {
    if (this.isVisible) return;
    this.createPopupHTML();
    this.attachEventListeners();
    setTimeout(() => {
      this.overlay.classList.add('active');
      this.isVisible = true;
      if (this.onShow && typeof this.onShow === 'function') {
        this.onShow();
      }
    }, 10);
  }
  close() {
    if (!this.isVisible) return;
    this.overlay.classList.add('closing');
    setTimeout(() => {
      this.overlay.classList.remove('active');
      this.overlay.classList.remove('closing');
      this.isVisible = false;
      this.markAsShown();
      this.removeEventListeners();
      if (this.onClose && typeof this.onClose === 'function') {
        this.onClose();
      }
    }, 300);
  }
  markAsShown() {
    const currentTime = Date.now();
    localStorage.setItem(this.storageTimeKey, currentTime.toString());
  }
  clearStorage() {
    localStorage.removeItem(this.storageTimeKey);
  }
  createPopupHTML() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'popup-promo-overlay';
    this.overlay.id = 'popup-promo-overlay';
    this.container = document.createElement('div');
    this.container.className = 'popup-promo-container';
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'popup-promo-image';
    const picture = document.createElement('picture');
    const sourceMobile = document.createElement('source');
    sourceMobile.media = '(max-width: 768px)';
    sourceMobile.srcset = '/assets/img/popup-promo-mobile.webp';
    sourceMobile.type = 'image/webp';
    const sourceDesktop = document.createElement('source');
    sourceDesktop.media = '(min-width: 769px)';
    sourceDesktop.srcset = '/assets/img/popup-promo-desktop.webp';
    sourceDesktop.type = 'image/webp';
    const img = document.createElement('img');
    img.src = '/assets/img/popup-promo-desktop.webp';
    img.alt = 'Promo Banner';
    img.loading = 'lazy';
    img.decoding = 'async';
    picture.appendChild(sourceMobile);
    picture.appendChild(sourceDesktop);
    picture.appendChild(img);
    imageWrapper.appendChild(picture);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-promo-close';
    closeBtn.setAttribute('aria-label', 'Tutup popup promo');
    closeBtn.setAttribute('type', 'button');
    closeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'popup-promo-cta';
    ctaBtn.textContent = 'Lihat Promo';
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.actionUrl !== '#') {
        window.open(this.actionUrl, this.actionTarget);
      }
      this.close();
    });
    this.container.appendChild(imageWrapper);
    this.container.appendChild(closeBtn);
    this.container.appendChild(ctaBtn);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }
  attachEventListeners() {
    const closeBtn = this.overlay.querySelector('.popup-promo-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
    this.escKeyListener = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escKeyListener);
  }
  removeEventListeners() {
    if (this.escKeyListener) {
      document.removeEventListener('keydown', this.escKeyListener);
      this.escKeyListener = null;
    }
  }
  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.removeEventListeners();
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
      this.container = null;
    }
    this.isVisible = false;
  }
  reset() {
    this.clearStorage();
    this.destroy();
  }
}
window.addEventListener('load', async () => {
  const currentPath = window.location.pathname;
  const isAuthOrDashboard = currentPath.includes('/auth') || currentPath.includes('/dashboard');
  if (isAuthOrDashboard) return;
  if (!document.getElementById('popup-promo-overlay')) {
    const popupPromo = new PopupPromo({
      storageKey: 'sisitus_popup_promo_shown',
      delay: 10000,
      actionUrl: '/promo/',
      actionTarget: '_self',
      onShow: () => {},
      onClose: () => {}
    });
    await popupPromo.init();
    window.popupPromoInstance = popupPromo;
  }
});