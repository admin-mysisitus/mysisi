/* ========== TENTANG & TIM PAGE - MERGED INTERACTIONS ========== */
/* Halaman tentang dan tim SISITUS dengan timeline, values, tim, dan partnership interactions */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ========== TIMELINE INTERACTIVE ==========
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  timelineItems.forEach((item, index) => {
    const content = item.querySelector('.timeline-content');
    
    item.addEventListener('click', function () {
      const year = this.querySelector('.timeline-date')?.textContent || 'Unknown';
      
      if (content) {
        const isExpanded = this.classList.contains('expanded');
        content.style.maxHeight = isExpanded ? '' : content.scrollHeight + 'px';
        this.classList.toggle('expanded');
      }
    });

    // Keyboard accessibility
    item.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });

    // Add animation
    item.style.animation = `slideInUp 0.6s ease-out ${index * 0.1}s both`;
  });

  // ========== VALUES EXPANDED INTERACTION ==========
  const valueExpandedCards = document.querySelectorAll('.value-expanded');
  
  valueExpandedCards.forEach(card => {
    const valueNumber = card.querySelector('.value-number');
    
    card.addEventListener('mouseenter', function () {
      if (valueNumber) {
        valueNumber.style.transform = 'scale(1.2) rotate(-5deg)';
      }
    });

    card.addEventListener('mouseleave', function () {
      if (valueNumber) {
        valueNumber.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  });

  // ========== CTA BUTTONS INTERACTION ==========
  // Auto-initialized by HeroComponent.initAll() - no manual setup needed
  // CTA buttons akan mendapatkan hover effects, animations, dan ripple effect secara otomatis

  // ========== TEAM MEMBER CARD INTERACTION ==========
  const teamCards = document.querySelectorAll('.team-card');
  
  teamCards.forEach(card => {
    // Hover effect
    if (!isTouch()) {
      card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px)';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
      });
    }
  });

  // ========== PARTNER COMPANY SHOWCASE ==========
  // Hover effects untuk partner cards sudah ditangani oleh CSS
  const partnerImages = document.querySelectorAll('.partner-image');
  
  partnerImages.forEach(partner => {
    partner.addEventListener('click', function () {
      const overlay = this.querySelector('.partner-overlay');
      if (overlay && isTouch()) {
        overlay.style.opacity = overlay.style.opacity === '1' ? '0' : '1';
      }
    });
  });

  // ========== COLLABORATION & CTA BUTTONS ==========
  const collaborationBtns = document.querySelectorAll('.collaboration-section .btn');
  
  collaborationBtns.forEach((btn, index) => {
    btn.addEventListener('click', function (e) {
      // Only handle partnership button with WhatsApp redirect
      if (index === 0 && (!this.getAttribute('href') || this.getAttribute('href') === '/kontak/')) {
        e.preventDefault();
        const message = 'Saya tertarik untuk berkolaborasi dengan SISITUS';
        window.open('https://wa.me/6281215289095?text=' + encodeURIComponent(message), '_blank');
      }
      // Career link navigates normally to /perusahaan/karir/
    });
  });

  // ========== TIMELINE CONTENT MAX-HEIGHT ==========
  // Set initial max-height for non-expanded timeline items
  timelineItems.forEach(item => {
    const content = item.querySelector('.timeline-content');
    if (content && !item.classList.contains('expanded')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });

  // ========== METRICS COUNT UP ANIMATION ==========
  const metricNumbers = document.querySelectorAll('.metric-number');
  
  const animateCountUp = (element) => {
    const originalText = element.textContent;
    // Extract numbers, decimal point, and surrounding text
    const match = originalText.match(/^(.*?)([0-9.]+)(.*?)$/);
    if (!match) return;

    const prefix = match[1];
    const numberText = match[2];
    const suffix = match[3];

    const isFloat = numberText.includes('.');
    const endValue = parseFloat(numberText);
    const duration = 2500; // Extend duration to 2.5s for better effect
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const currentValue = easeProgress * endValue;
      
      const displayValue = isFloat ? currentValue.toFixed(1) : Math.floor(currentValue);
      element.textContent = `${prefix}${displayValue}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = originalText; // Ensure exact final text
      }
    };
    
    element.setAttribute('data-animated', 'true');
    element.textContent = `${prefix}0${suffix}`; // Start at 0 visually
    window.requestAnimationFrame(step);
  };

  const countUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
        // Beri sedikit delay agar terlihat lebih natural
        setTimeout(() => {
          animateCountUp(entry.target);
        }, 200);
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.5,
    rootMargin: "0px 0px -50px 0px"
  });

  metricNumbers.forEach(metric => {
    countUpObserver.observe(metric);
  });

  // ========== EXCLUSIVE ACCORDION (AUTO-CLOSE OTHERS) ==========
  const detailElements = document.querySelectorAll('details');
  detailElements.forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        const parent = detail.parentElement;
        if (parent) {
          parent.querySelectorAll('details').forEach(otherDetail => {
            if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
              otherDetail.removeAttribute('open');
            }
          });
        }
      }
    });
  });

  // ========== VISION MISSION TABS ==========
  const tabBtns = document.querySelectorAll('.vm-tab-btn');
  const tabContents = document.querySelectorAll('.vm-tab-content');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById('tab-' + targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // ========== AUTO SCROLL SLIDERS ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    
    let autoScrollInterval;
    let resumeTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    
    let track = sliderElement.firstElementChild;
    // Adaptasi jika sliderElement tidak memiliki wrapper melainkan langsung berisi item (contoh: vm-tabs-header)
    if (track && (track.tagName === 'BUTTON' || track.classList.contains('vm-tab-btn'))) {
      track = sliderElement;
    }
    
    if(!track || track.children.length === 0) return;
    
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
        const gap = parseFloat(window.getComputedStyle(track).gap) || 24; 
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

    sliderElement.addEventListener('scroll', handleInteraction, {passive: true});
    sliderElement.addEventListener('wheel', handleInteraction, {passive: true});
    sliderElement.addEventListener('touchstart', handleInteraction, {passive: true});
    sliderElement.addEventListener('mousedown', handleInteraction);
    
    startAutoScroll();
  }

  initAutoSnapSlider(document.querySelector('.team-slider-container'));
  initAutoSnapSlider(document.querySelector('.vm-tabs-header'));

  // ========== UTILITY FUNCTIONS ==========
  function isTouch() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }

  // ======================
  // Sponsor Section (Partners)
  // ======================
  const template = document.getElementById("sponsors-template");
  const row1 = document.getElementById("row1");
  const row2 = document.getElementById("row2");

  if (template && row1 && row2) {
    const trackTemplate = template.content.querySelector(".sponsors-track");
    if (trackTemplate) {
      // Clone untuk loop
      const track1 = trackTemplate.cloneNode(true);
      const track2 = trackTemplate.cloneNode(true);

      // Gandakan isi berkali-kali agar sangat panjang (karena gambarnya cuma 5)
      // repeat(10) memastikan cukup untuk layar monitor ultrawide sekalipun
      track1.innerHTML = track1.innerHTML.repeat(10);
      track2.innerHTML = track2.innerHTML.repeat(10);

      // Tambahkan class animasi berlawanan arah
      track1.classList.add("scroll-left");
      track2.classList.add("scroll-right");

      // Masukkan ke DOM
      row1.appendChild(track1);
      row2.appendChild(track2);
    }
  }

});

// ========== ANIMATION KEYFRAMES (injected via script) ==========
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    25% {
      transform: scale(1.15) rotate(-15deg);
    }
    50% {
      transform: scale(1.2) rotate(5deg);
    }
    75% {
      transform: scale(1.15) rotate(-5deg);
    }
  }

  /* slideInUp, slideInLeft, dan ripple keyframes sudah di-handle oleh HeroComponent */
  /* @keyframes slideInUp digunakan untuk CTA buttons animation */
  /* @keyframes ripple digunakan untuk CTA buttons ripple effect */

  .value-expanded .value-number {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;
document.head.appendChild(style);
