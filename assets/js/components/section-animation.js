// ========== UNIVERSAL ANIMATION TRIGGER SYSTEM ==========
// Animasi otomatis untuk semua elemen dengan animasi pada load dan scroll

// Selectors yang punya animasi CSS
const ANIMATED_SELECTORS = [
  '[class*="card"]',
  '[class*="item"]', 
  '[class*="post"]',
  '[class*="package"]',
  '.timeline-item',
  '.section',
  '.slide-smooth',
  '.slide-slow',
  '.slide-right',
  '.slide-left',
  '.slide-down',
  '.zoom-in',
  '.slide-scale-up',
  '.fade-in-fast'
];

// Intersection Observer untuk trigger animasi saat enter viewport
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Initialize animations on page load dan scroll
const initializeAnimations = () => {
  // Cari semua elemen yang punya animasi
  const animatedElements = document.querySelectorAll(ANIMATED_SELECTORS.join(', '));
  
  animatedElements.forEach(element => {
    // Pastikan elemen punya animation property di CSS
    const computedStyle = window.getComputedStyle(element);
    const animationName = computedStyle.animationName;
    
    // Jika ada animasi, masukkan ke observer
    if (animationName && animationName !== 'none') {
      // Pause animasi sampai element terlihat di viewport
      element.style.animationPlayState = 'paused';
      observer.observe(element);
    }
  });
};

// Panggil saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
  initializeAnimations();
}

// Re-initialize jika ada dinamik content (optional)
window.addEventListener('load', () => {
  // Trigger animasi yang sudah di-pause
  const pausedElements = document.querySelectorAll('[style*="animation-play-state: paused"]');
  pausedElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      element.style.animationPlayState = 'running';
    }
  });
});


