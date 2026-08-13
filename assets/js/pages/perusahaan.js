/* ========== PERUSAHAAN PAGE INTERACTIONS ========== */
/* Import common interactions dan tambahkan logic spesifik perusahaan */
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  // ========== STAT COUNTER ANIMATION ==========
  const statsSection = document.querySelector('.company-highlight-section');
  const statBoxes = document.querySelectorAll('.metric-list-item');
  let hasAnimated = false;
  const animateStats = () => {
    if (hasAnimated || !statsSection) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statBoxes.forEach(box => {
            const span = box.querySelector('.metric-number');
            if (!span) return;
            const text = span.textContent.trim();
            const numMatch = text.match(/(\d+)/);
            if (!numMatch) return;
            const finalValue = numMatch[1];
            const isPercentage = text.includes('%');
            const isPlus = text.includes('+');
            const finalNum = parseInt(finalValue);
            let currentNum = 0;
            // If the number is small (e.g. 7), increment by 1. Otherwise split it up.
            const increment = Math.max(1, Math.ceil(finalNum / 30));
            const duration = 1500; // 1.5 seconds for animation
            const stepTime = duration / (finalNum / increment);
            const counter = setInterval(() => {
              currentNum += increment;
              if (currentNum >= finalNum) {
                currentNum = finalNum;
                clearInterval(counter);
              }
              const display = isPercentage ? currentNum + '%' : (isPlus ? currentNum + '+' : currentNum);
              span.textContent = display;
            }, stepTime);
          });
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.5
    });
    observer.observe(statsSection);
  };
  animateStats();
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
});
// ========== ANIMATION KEYFRAMES (injected via script) ==========
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
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
document.head.appendChild(style);