class HeroComponent {
  constructor(options = {}) {
    this.options = {
      title: '',
      description: '',
      cta: null,
      ctaSecondary: null,
      variant: 'default',
      ...options
    };
  }
  render(container = 'main') {
    const target = typeof container === 'string' ? document.querySelector(container) : container;
    if (!target) {
      console.log('Hero: Target container not found');
      return null;
    }
    const sectionClass = this._getSectionClass();
    const heroSection = document.createElement('section');
    heroSection.className = sectionClass;
    const heroDiv = document.createElement('div');
    heroDiv.className = 'container';
    if (this.options.title) {
      const h1 = document.createElement('h1');
      h1.textContent = this.options.title;
      heroDiv.appendChild(h1);
    }
    if (this.options.description) {
      const p = document.createElement('p');
      p.textContent = this.options.description;
      heroDiv.appendChild(p);
    }
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
    target.insertBefore(heroSection, target.firstChild);
    return heroSection;
  }
  _getSectionClass() {
    const variant = this.options.variant || 'default';
    const sectionMap = {
      'default': 'hero',
      'home': 'hero hero-home',
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
  update(updates) {
    this.options = {
      ...this.options,
      ...updates
    };
  }
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
  static initCTAButtons(selector = '.cta-buttons', options = {}) {
    const defaults = {
      enableRipple: true,
      enableAnimation: true,
      animationDelay: 0.1,
      hoverScale: 1.05,
      hoverTranslate: -6,
      isTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)
    };
    const config = {
      ...defaults,
      ...options
    };
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
    const ctaContainers = document.querySelectorAll(selector);
    if (ctaContainers.length === 0) {
      return;
    }
    ctaContainers.forEach(container => {
      const buttons = container.querySelectorAll('.btn');
      buttons.forEach((btn, index) => {
        if (config.enableAnimation) {
          btn.style.animation = `slideInUp 0.6s ease-out ${config.animationDelay + (index * 0.1)}s backwards`;
        }
        if (!config.isTouch) {
          btn.addEventListener('mouseenter', function() {
            this.style.transform = `translateY(${config.hoverTranslate}px) scale(${config.hoverScale})`;
          });
          btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
          });
        }
        if (config.enableRipple && !config.isTouch) {
          btn.addEventListener('click', function(e) {
            if (this.tagName === 'A' && this.href) {}
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
  }
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HeroComponent.initAll();
  });
} else {
  HeroComponent.initAll();
}