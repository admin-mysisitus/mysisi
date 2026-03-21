/**
 * Hero Component
 * Komponen hero dan CTA sections yang reusable untuk semua halaman
 * Handles dynamic rendering dan initialization
 */

class HeroComponent {
  constructor(options = {}) {
    this.options = {
      title: '',
      description: '',
      cta: null, // {label: string, href: string}
      ctaSecondary: null,
      variant: 'default', // 'default', 'home', 'artikel', 'cta', 'promo-cta', atau CTA section variants
      ...options
    };
  }

  /**
   * Render hero element
   * @param {string} container - Selector atau element untuk tempat hero
   * @returns {HTMLElement}
   */
  render(container = 'main') {
    const target = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!target) {
      console.error('Hero: Target container not found');
      return null;
    }

    // Tentukan class berdasarkan variant
    const sectionClass = this._getSectionClass();
    const heroSection = document.createElement('section');
    heroSection.className = sectionClass;

    const heroDiv = document.createElement('div');
    heroDiv.className = 'container';

    // Title
    if (this.options.title) {
      const h1 = document.createElement('h1');
      h1.textContent = this.options.title;
      heroDiv.appendChild(h1);
    }

    // Description
    if (this.options.description) {
      const p = document.createElement('p');
      p.textContent = this.options.description;
      heroDiv.appendChild(p);
    }

    // CTA Buttons
    if (this.options.cta || this.options.ctaSecondary) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'cta-buttons';

      if (this.options.cta) {
        const primaryBtn = document.createElement('a');
        primaryBtn.href = this.options.cta.href;
        primaryBtn.className = 'btn btn-primary';
        primaryBtn.textContent = this.options.cta.label;
        ctaDiv.appendChild(primaryBtn);
      }

      if (this.options.ctaSecondary) {
        const secondaryBtn = document.createElement('a');
        secondaryBtn.href = this.options.ctaSecondary.href;
        secondaryBtn.className = 'btn btn-secondary';
        secondaryBtn.textContent = this.options.ctaSecondary.label;
        ctaDiv.appendChild(secondaryBtn);
      }

      heroDiv.appendChild(ctaDiv);
    }

    heroSection.appendChild(heroDiv);
    
    // Insert as first child of main
    target.insertBefore(heroSection, target.firstChild);

    return heroSection;
  }

  /**
   * Get section class based on variant
   * @private
   * @returns {string}
   */
  _getSectionClass() {
    const variant = this.options.variant || 'default';
    
    // Map semua CTA section variants ke class name yang sesuai
    const sectionMap = {
      'default': 'hero',
      'home': 'hero hero-home',
      'artikel': 'hero hero-artikel',
      'cta': 'detail-cta-section',
      'promo-cta': 'promo-cta-final-section',
      'home-cta': 'cta-final-section',
      'layanan-cta': 'layanan-cta-section',
      'tips-cta': 'tips-cta-section',
      'karir-cta': 'karir-cta-section',
      'company-cta': 'company-cta-section',
      'about-cta': 'about-cta-section',
      'kontak-cta': 'kontak-cta-section'
    };
    
    return sectionMap[variant] || `hero hero-${variant}`;
  }

  /**
   * Update hero content
   * @param {object} updates - Object dengan property yang ingin diupdate
   */
  update(updates) {
    this.options = { ...this.options, ...updates };
  }

  /**
   * Static method untuk render CTA section
   * @static
   * @param {string} title - Judul CTA section
   * @param {string} description - Deskripsi CTA section
   * @param {object} cta - Primary CTA button {label, href}
   * @param {object} ctaSecondary - Secondary CTA button (optional) {label, href}
   * @param {string} container - Container selector (default: main)
   * @param {string} variant - Variant CTA: 'detail', 'promo', 'home-cta', 'layanan-cta', 'tips-cta', 'karir-cta', 'company-cta', 'about-cta', 'kontak-cta'
   * @returns {HTMLElement}
   */
  static renderCTA(title, description, cta, ctaSecondary = null, container = 'main', variant = 'cta') {
    const component = new HeroComponent({
      title,
      description,
      cta,
      ctaSecondary,
      variant
    });
    return component.render(container);
  }

  /**
   * Initialize CTA buttons interactions untuk semua CTA sections
   * Menambahkan hover effects, animations, dan ripple effect
   * @static
   * @param {string} selector - Selector untuk CTA buttons container (default: '.cta-buttons')
   * @param {object} options - Configuration options
   * @returns {void}
   */
  static initCTAButtons(selector = '.cta-buttons', options = {}) {
    const defaults = {
      enableRipple: true,
      enableAnimation: true,
      animationDelay: 0.1,
      hoverScale: 1.05,
      hoverTranslate: -6,
      isTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)
    };

    const config = { ...defaults, ...options };

    // Setup keyframe animations jika belum ada
    if (config.enableAnimation && !document.querySelector('style[data-hero-animations]')) {
      const style = document.createElement('style');
      style.setAttribute('data-hero-animations', '');
      style.textContent = `
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Query all CTA containers
    const ctaContainers = document.querySelectorAll(selector);
    
    if (ctaContainers.length === 0) {
      console.log('HeroComponent: No CTA buttons found with selector', selector);
      return;
    }

    ctaContainers.forEach(container => {
      const buttons = container.querySelectorAll('.btn');
      
      buttons.forEach((btn, index) => {
        // Add animated entrance
        if (config.enableAnimation) {
          btn.style.animation = `slideInUp 0.6s ease-out ${config.animationDelay + (index * 0.1)}s backwards`;
        }

        // Hover effects (desktop only)
        if (!config.isTouch) {
          btn.addEventListener('mouseenter', function () {
            this.style.transform = `translateY(${config.hoverTranslate}px) scale(${config.hoverScale})`;
          });

          btn.addEventListener('mouseleave', function () {
            this.style.transform = '';
          });
        }

        // Click ripple effect (desktop only)
        if (config.enableRipple && !config.isTouch) {
          btn.addEventListener('click', function (e) {
            // Prevent ripple jika button adalah link biasa yang berfungsi normal
            if (this.tagName === 'A' && this.href) {
              // Izinkan default behavior
            }

            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
          });
        }
      });
    });

    console.log('HeroComponent: Initialized', ctaContainers.length, 'CTA button containers');
  }

  /**
   * Initialize semua hero dan CTA components di halaman saat DOMContentLoaded
   * @static
   * @param {object} options - Configuration options
   * @returns {void}
   */
  static initAll(options = {}) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        HeroComponent.initCTAButtons('.cta-buttons', options);
      });
    } else {
      HeroComponent.initCTAButtons('.cta-buttons', options);
    }
  }
}

// Auto-initialize CTA buttons saat DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HeroComponent.initAll();
  });
} else {
  HeroComponent.initAll();
}

// Export untuk digunakan di module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroComponent;
}
