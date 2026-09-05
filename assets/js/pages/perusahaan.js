/* ========== PERUSAHAAN PAGE INTERACTIONS ========== */
/* Import common interactions dan tambahkan logic spesifik perusahaan */
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  // ========== NAVIGATE CARDS INTERACTION ==========
  const navigateCards = document.querySelectorAll('.navigate-card');
  navigateCards.forEach(card => {
    // Hover effect for desktop
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'none';
      const icon = this.querySelector('i');
      if (icon) {
        icon.style.animation = 'none';
        setTimeout(() => {
          icon.style.animation = 'pulse 0.6s ease-in-out';
        }, 10);
      }
    });
    card.addEventListener('mouseleave', function() {
      const icon = this.querySelector('i');
      if (icon) {
        icon.style.animation = 'none';
      }
    });
    // Click feedback for mobile
    card.addEventListener('click', function(e) {
      if (window.innerWidth < 768) {
        e.preventDefault();
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
          this.style.transform = '';
          window.location.href = this.href;
        }, 200);
      }
    });
  });
  // ========== HIGHLIGHT CARDS IMPROVEMENTS ==========
  const highlightCards = document.querySelectorAll('.highlight-card');
  highlightCards.forEach(card => {
    const icon = card.querySelector('i');
    if (icon) {
      card.addEventListener('mouseenter', function() {
        icon.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        icon.style.transform = 'scale(1.25) rotate(10deg)';
      });
      card.addEventListener('mouseleave', function() {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
    }
  });
  // ========== ICON CARD POPUP AUTO-SCROLL ==========
  const iconCards = document.querySelectorAll('.icon-card');
  iconCards.forEach(card => {
    const handleScroll = () => {
      const popup = card.querySelector('.icon-card-popup');
      if (!popup) return;
      // Small delay to allow the CSS transition to reveal the popup
      setTimeout(() => {
        const popupRect = popup.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        // If the bottom of the popup is cut off by the bottom of the viewport
        if (popupRect.bottom > windowHeight) {
          // Calculate exact scroll needed to show the bottom with 24px margin
          const scrollAmount = popupRect.bottom - windowHeight + 24;
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      }, 300); // Matches the 0.3s CSS transition duration
    };
    card.addEventListener('mouseenter', handleScroll);
    card.addEventListener('focusin', handleScroll);
  });
  // ========== CTA BUTTONS INTERACTION ==========
  // Auto-initialized by HeroComponent.initAll() - no manual setup needed
  // CTA buttons akan mendapatkan hover effects, animations, dan ripple effect secara otomatis
  // ========== REVEAL ON SCROLL ANIMATION ==========
  const revealElements = document.querySelectorAll('.reveal-up');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      let delay = 0;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          delay += 100; // 100ms stagger
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });
    revealElements.forEach(el => revealObserver.observe(el));
  }
  // ========== VISION MISSION TABS ==========
  const tabBtns = document.querySelectorAll('.vm-tab-btn');
  const tabContents = document.querySelectorAll('.vm-tab-content');
  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = `tab-${btn.getAttribute('data-tab')}`;
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  }
  // ========== AUTO SCROLL SLIDERS ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;
    let track = sliderElement.firstElementChild;
    // Adaptasi jika sliderElement tidak memiliki wrapper melainkan langsung berisi item
    if (track && (track.classList.contains('metric-list-item') || track.classList.contains('mission-card'))) {
      track = sliderElement;
    }
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
        sliderElement.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        const cardWidth = track.children[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
        sliderElement.scrollBy({
          left: cardWidth + gap,
          behavior: 'smooth'
        });
      }
      // Reset flag after smooth scroll is expected to complete
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
      // Ignore scroll events triggered by our own script's scrollToNext
      if (e && e.type === 'scroll' && isAutoScrolling) return;
      stopAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoScroll, resumeDelay);
    };
    // Listen to manual interaction events
    sliderElement.addEventListener('scroll', handleInteraction, {
      passive: true
    });
    sliderElement.addEventListener('wheel', handleInteraction, {
      passive: true
    });
    sliderElement.addEventListener('touchstart', handleInteraction, {
      passive: true
    });
    sliderElement.addEventListener('mousedown', handleInteraction);
    startAutoScroll();
  }
  initAutoSnapSlider(document.querySelector('.diff-slider-container'));
  initAutoSnapSlider(document.querySelector('.team-slider-container'));
  initAutoSnapSlider(document.querySelector('.compact-metrics-list'));
  initAutoSnapSlider(document.querySelector('.mission-cards-grid'));
  // ========== TEAM BIO EXPAND ==========
  const teamBios = document.querySelectorAll('.team-bio');
  const teamSliderContainer = document.querySelector('.team-slider-container');
  // Fungsi penolong untuk menutup semua bio
  const closeAllBios = (exceptBio = null) => {
    teamBios.forEach(bio => {
      if (bio !== exceptBio) bio.classList.remove('expanded');
    });
  };
  teamBios.forEach(bio => {
    bio.title = "Ketuk untuk memperluas/menyembunyikan teks";
    bio.addEventListener('click', function(e) {
      e.stopPropagation(); // Mencegah global click handler membatalkan aksi ini
      const isExpanded = this.classList.contains('expanded');
      closeAllBios(); // Tutup yang lain
      if (!isExpanded) this.classList.add('expanded'); // Buka yang ini jika belum terbuka
    });
  });
  // Tutup otomatis saat mulai scroll/geser (swipe)
  if (teamSliderContainer) {
    teamSliderContainer.addEventListener('scroll', () => closeAllBios(), {
      passive: true
    });
    teamSliderContainer.addEventListener('touchstart', () => closeAllBios(), {
      passive: true
    });
  }
  // Tutup otomatis jika klik di area layar lainnya
  document.addEventListener('click', () => closeAllBios());
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
  // --- MERGED FROM TENTANG.JS ---
  // ========== TIMELINE INTERACTIVE ==========
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    const content = item.querySelector('.timeline-content');
    item.addEventListener('click', function() {
      const year = this.querySelector('.timeline-date')?.textContent || 'Unknown';
      if (content) {
        const isExpanded = this.classList.contains('expanded');
        content.style.maxHeight = isExpanded ? '' : content.scrollHeight + 'px';
        this.classList.toggle('expanded');
      }
    });
    // Keyboard accessibility
    item.addEventListener('keypress', function(e) {
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
    card.addEventListener('mouseenter', function() {
      if (valueNumber) {
        valueNumber.style.transform = 'scale(1.2) rotate(-5deg)';
      }
    });
    card.addEventListener('mouseleave', function() {
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
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
      });
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    }
  });
  // ========== PARTNER COMPANY SHOWCASE ==========
  // Hover effects untuk partner cards sudah ditangani oleh CSS
  const partnerImages = document.querySelectorAll('.partner-image');
  partnerImages.forEach(partner => {
    partner.addEventListener('click', function() {
      const overlay = this.querySelector('.partner-overlay');
      if (overlay && isTouch()) {
        overlay.style.opacity = overlay.style.opacity === '1' ? '0' : '1';
      }
    });
  });
  // ========== COLLABORATION & CTA BUTTONS ==========
  const collaborationBtns = document.querySelectorAll('.collaboration-section .btn');
  collaborationBtns.forEach((btn, index) => {
    btn.addEventListener('click', function(e) {
      // Only handle partnership button with WhatsApp redirect
      if (index === 0 && (!this.getAttribute('href') || this.getAttribute('href') === '/bantuan/')) {
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
  // ========== UTILITY FUNCTIONS ==========
  function isTouch() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
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
      // Ambil semua logo dari template
      const allLogos = Array.from(trackTemplate.querySelectorAll('img'));
      // Bagi dua secara berurutan layaknya rantai
      const halfIndex = Math.ceil(allLogos.length / 2);
      const logos1 = allLogos.slice(0, halfIndex).map(img => img.outerHTML).join('');
      const logos2 = allLogos.slice(halfIndex).map(img => img.outerHTML).join('');
      // Buat track untuk baris 1
      const track1 = document.createElement('div');
      track1.className = 'sponsors-track scroll-left';
      // Repeat genap (misal 6) agar translasi -50% menghasilkan loop mulus tanpa jeda
      track1.innerHTML = logos1.repeat(6);
      // Buat track untuk baris 2
      const track2 = document.createElement('div');
      track2.className = 'sponsors-track scroll-right';
      track2.innerHTML = logos2.repeat(6);
      // Masukkan ke DOM
      row1.appendChild(track1);
      row2.appendChild(track2);
    }
  }
});
// ========== ANIMATION KEYFRAMES (injected via script) ==========
const perusahaanStyle = document.createElement('style');
perusahaanStyle.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.15) translateY(-4px);
    }
    50% {
      transform: scale(1.2);
    }
    75% {
      transform: scale(1.15) translateY(-2px);
    }
  }
`;
document.head.appendChild(perusahaanStyle);
const tentangStyle = document.createElement('style');
tentangStyle.textContent = `
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
document.head.appendChild(tentangStyle);