const ANIMATED_SELECTORS = ['[class*="card"]', '[class*="item"]', '[class*="post"]', '[class*="package"]', '.timeline-item', '.section', '.slide-smooth', '.slide-slow', '.slide-right', '.slide-left', '.slide-down', '.zoom-in', '.slide-scale-up', '.fade-in-fast'];
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
const initializeAnimations = () => {
  const animatedElements = document.querySelectorAll(ANIMATED_SELECTORS.join(', '));
  animatedElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const animationName = computedStyle.animationName;
    if (animationName && animationName !== 'none') {
      element.style.animationPlayState = 'paused';
      observer.observe(element);
    }
  });
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
  initializeAnimations();
}
window.addEventListener('load', () => {
  const pausedElements = document.querySelectorAll('[style*="animation-play-state: paused"]');
  pausedElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      element.style.animationPlayState = 'running';
    }
  });
});