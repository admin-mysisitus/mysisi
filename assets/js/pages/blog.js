/* Blog Page Script - Auto Snap Slider untuk Mobile & Filter */
document.addEventListener('DOMContentLoaded', () => {
  // Fungsi Inisialisasi Slider Horizontal dengan Auto-Snap (serupa halaman Perusahaan & Domain Hosting)
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;

    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 3000;
    const resumeDelay = 3500;

    let track = sliderElement;
    if (!track || track.children.length === 0) return;

    const scrollToNext = () => {
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;

      // Jangan jalankan animasi jika kontennya muat (desktop/tanpa horizontal scroll)
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

  // Inisialisasi slider horizontal untuk mobile pada grid blog
  initAutoSnapSlider(document.querySelector('.featured-grid'));
  initAutoSnapSlider(document.querySelector('.articles-grid'));
});
