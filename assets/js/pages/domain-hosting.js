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

  // ========== FEATURE CARD INTERACTION ==========
  const featureCards = document.querySelectorAll('.feature-card-item');
  
  featureCards.forEach((card, index) => {
    card.style.animation = `slideInUp 0.6s ease-out ${index * 0.08}s both`;
  });

  // ========== AUTO SCROLL SLIDERS (SERUPA HALAMAN PERUSAHAAN) ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;

    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;

    let track = sliderElement;
    if (!track || track.children.length === 0) return;

    const scrollToNext = () => {
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;

      // Jangan jalankan animasi jika kontennya muat (tidak ada scrollbar horizontal), contoh: mode desktop
      if (clientWidth >= scrollWidth - 5) return;

      isAutoScrolling = true;
      if (scrollFlagTimeout) clearTimeout(scrollFlagTimeout);

      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderElement.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const cardWidth = track.children[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 16;
        sliderElement.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
      }

      scrollFlagTimeout = setTimeout(() => {
        isAutoScrolling = false;
      }, 800);
    };

    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollInterval = setInterval(scrollToNext, slideInterval);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };

    const handleInteraction = (e) => {
      if (e && e.type === 'scroll' && isAutoScrolling) return;

      stopAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoScroll, resumeDelay);
    };

    sliderElement.addEventListener('scroll', handleInteraction, { passive: true });
    sliderElement.addEventListener('wheel', handleInteraction, { passive: true });
    sliderElement.addEventListener('touchstart', handleInteraction, { passive: true });
    sliderElement.addEventListener('mousedown', handleInteraction);

    startAutoScroll();
  }

  // Inisialisasi slider untuk mobile
  initAutoSnapSlider(document.querySelector('.benefits-grid'));
  initAutoSnapSlider(document.querySelector('.simple-packages'));
  initAutoSnapSlider(document.querySelector('.hosting-packages-grid'));
  initAutoSnapSlider(document.querySelector('.features-grid'));
  initAutoSnapSlider(document.querySelector('.migration-steps-grid'));

  function isTouch() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }

});
