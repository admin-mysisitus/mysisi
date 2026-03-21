/* ========== DOMAIN & HOSTING PAGE INTERACTIONS ========== */
/* Detail halaman layanan domain & hosting dengan pricing dan features */

document.addEventListener('DOMContentLoaded', function () {
  // ========== BENEFIT ITEMS HOVER ANIMATION ==========
  const benefitItems = document.querySelectorAll('.benefit-item');
  
  benefitItems.forEach(item => {
    const icon = item.querySelector('i');
    
    if (icon && !isTouch()) {
      item.addEventListener('mouseenter', function () {
        icon.style.animation = 'none';
        setTimeout(() => {
          icon.style.animation = 'iconRotate 0.6s ease-in-out';
        }, 10);
      });
    }
  });

  // ========== DOMAIN PACKAGES INTERACTION ==========
  const domainPackages = document.querySelectorAll('.package-simple');
  
  domainPackages.forEach(pkg => {
    pkg.addEventListener('click', function () {
      const domain = this.querySelector('h3')?.textContent;
      const price = this.querySelector('.price')?.textContent;
      
      if (domain && price) {
        sessionStorage.setItem('selectedDomain', domain);
        sessionStorage.setItem('domainPrice', price);
        
        // Smooth highlight
        domainPackages.forEach(p => p.style.opacity = '0.6');
        this.style.opacity = '1';
        
        setTimeout(() => {
          domainPackages.forEach(p => p.style.opacity = '1');
        }, 1000);
      }
    });
  });

  // ========== HOSTING PLAN SELECTOR ==========
  const hostingPlans = document.querySelectorAll('.hosting-packages-grid .package-card');
  
  hostingPlans.forEach(plan => {
    const selectButton = plan.querySelector('.btn');
    
    if (selectButton) {
      selectButton.addEventListener('click', function (e) {
        e.preventDefault();
        
        const planName = plan.querySelector('h3')?.textContent || 'Unknown Plan';
        const planPrice = plan.querySelector('strong')?.textContent || 'Custom';
        
        if (planName && planPrice) {
          sessionStorage.setItem('selectedHostingPlan', planName);
          sessionStorage.setItem('hostingPrice', planPrice);
          
          // Visual feedback dengan class
          hostingPlans.forEach(p => p.classList.remove('selected'));
          plan.classList.add('selected');
        }
      });
    }
  });

  // ========== UPTIME GUARANTEE DISPLAY ==========
  const uptimeDisplay = document.querySelector('[data-uptime], .uptime-badge');
  
  if (uptimeDisplay) {
    const uptime = 99.9;
    uptimeDisplay.textContent = `${uptime}% Uptime Guarantee`;
    
    if (uptime >= 99.9) {
      uptimeDisplay.style.color = '#10B981';
    }
  }

  // ========== FEATURE COLUMN INTERACTION ==========
  const featureColumns = document.querySelectorAll('.feature-column');
  const featureItems = document.querySelectorAll('.feature-column li');
  
  featureColumns.forEach(col => {
    col.style.animation = `slideInUp 0.6s ease-out forwards`;
  });

  if (!isTouch()) {
    featureItems.forEach((item, index) => {
      item.addEventListener('mouseenter', function () {
        this.style.transform = 'translateX(8px)';
        this.style.color = 'var(--dark-navy)';
      });
      
      item.addEventListener('mouseleave', function () {
        this.style.transform = 'translateX(0)';
        this.style.color = 'var(--gray-medium)';
      });
    });
  }

  // ========== MIGRATION SECTION BUTTON ==========
  const migrationButton = document.querySelector('.detail-migration-section .btn');
  
  if (migrationButton) {
    migrationButton.addEventListener('click', function (e) {
      e.preventDefault();
      
      // Smooth scroll ke contact section atau form jika ada
      const contactSection = document.querySelector('.contact-section, [data-contact], form');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ========== FAQ ACCORDION INTERACTIONS ==========
  // FAQ functionality is now handled by faq.js component

  // ========== CTA BUTTONS INTERACTIONS ==========
  const ctaButtons = document.querySelectorAll('.detail-cta-section .btn');
  
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // Add ripple effect hanya untuk non-touch devices
      if (!isTouch()) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        if (!this.style.position) {
          this.style.position = 'relative';
        }
        if (!this.style.overflow) {
          this.style.overflow = 'hidden';
        }
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    });
  });

  // ========== SUPPORT CHANNELS ==========
  const supportChannels = document.querySelectorAll('[data-support-channel]');
  
  supportChannels.forEach(channel => {
    channel.addEventListener('click', function (e) {
      e.preventDefault();
      
      const platform = this.getAttribute('data-support-channel')?.toLowerCase();
      
      let url = '';
      if (platform === 'whatsapp') {
        url = 'https://wa.me/6281215289095';
      } else if (platform === 'email') {
        url = 'mailto:sisitus.com@gmail.com';
      }
      
      if (url) {
        window.open(url, '_blank');
      }
    });
  });

  function isTouch() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }

});
