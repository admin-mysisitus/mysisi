/* ========== PEMBUATAN WEBSITE PREMIUM INTERACTIONS ========== */
document.addEventListener('DOMContentLoaded', function() {
  // ========== 1. FEATURES VERTICAL TABS ==========
  const featBtns = document.querySelectorAll('.feat-btn');
  const featPanes = document.querySelectorAll('.feat-pane');
  featBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all
      featBtns.forEach(b => b.classList.remove('active'));
      featPanes.forEach(p => p.classList.remove('active'));
      // Add active to clicked
      this.classList.add('active');
      // Scroll nav to bring button into view on mobile
      const featuresNav = document.querySelector('.features-nav-vertical');
      if (featuresNav && window.innerWidth <= 768) {
        const scrollLeft = this.offsetLeft - (featuresNav.clientWidth / 2) + (this.clientWidth / 2);
        featuresNav.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
      // Show pane
      const targetId = this.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
  // ========== 2. PRICING TOGGLE ==========
  const priceBtns = document.querySelectorAll('.price-btn');
  const pricePanes = document.querySelectorAll('.price-pane');
  priceBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all
      priceBtns.forEach(b => b.classList.remove('active'));
      pricePanes.forEach(p => p.classList.remove('active'));
      // Add active to clicked
      this.classList.add('active');
      // Scroll nav on mobile
      const pricingNav = document.querySelector('.pricing-toggle-nav');
      if (pricingNav && window.innerWidth <= 768) {
        const scrollLeft = this.offsetLeft - (pricingNav.clientWidth / 2) + (this.clientWidth / 2);
        pricingNav.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
      // Show pane
      const targetId = this.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
  // ========== 3. AUTO SNAP SLIDER (RESPONSIVE HORIZONTAL CAROUSEL ON MOBILE) ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;
    let track = sliderElement.firstElementChild;
    if (track && (track.classList.contains('feat-card') || track.classList.contains('package-overview') || track.classList.contains('process-row') || track.classList.contains('bento-card') || track.classList.contains('portfolio-row') || track.classList.contains('portfolio-card'))) {
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
        let firstCard = track.children[0];
        if (firstCard && firstCard.classList.contains('portfolio-row')) {
          firstCard = firstCard.children[0] || firstCard;
        }
        const cardWidth = firstCard ? firstCard.offsetWidth : 280;
        const gap = parseFloat(window.getComputedStyle(sliderElement).gap) || parseFloat(window.getComputedStyle(track).gap) || 20;
        sliderElement.scrollBy({
          left: cardWidth + gap,
          behavior: 'smooth'
        });
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
  initAutoSnapSlider(document.querySelector('.features-grid-3col'));
  initAutoSnapSlider(document.querySelector('.packages-carousel'));
  initAutoSnapSlider(document.querySelector('.premium-process-list'));
  initAutoSnapSlider(document.querySelector('#portfolio-grid'));
  initAutoSnapSlider(document.querySelector('.premium-bento-grid'));
});