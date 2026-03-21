/* ========== HOME PAGE INTERACTIONS ========== */

document.addEventListener('DOMContentLoaded', function () {
  // ========== SPECIFIC HOME PAGE LOGIC ==========

  // FAQ functionality is now handled by faq.js component

  // ========== SERVICE CARD FEATURES TOGGLE ==========
  const toggleButtons = document.querySelectorAll('.toggle-features');
  if (toggleButtons.length > 0) {
    toggleButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const featuresList = this.nextElementSibling;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          featuresList.setAttribute('hidden', '');
        } else {
          this.setAttribute('aria-expanded', 'true');
          featuresList.removeAttribute('hidden');
        }
      });
    });
  }

  // ========== STATS COUNTER ANIMATION ==========
  const animateCounter = (element) => {
    const finalValue = element.innerText;
    const numericValue = parseInt(finalValue.replace(/\D/g, ''));
    const isPercentage = finalValue.includes('%');
    const hasPlus = finalValue.includes('+');
    
    let currentValue = 0;
    const duration = 2000;
    const increment = numericValue / (duration / 50);
    
    const interval = setInterval(() => {
      currentValue += increment;
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(interval);
      }
      
      let displayValue = Math.floor(currentValue);
      if (isPercentage) {
        element.innerText = displayValue + '%';
      } else if (hasPlus) {
        element.innerText = displayValue + '+';
      } else {
        element.innerText = displayValue;
      }
    }, 50);
  }

  // Trigger counter animation pada görünüm
  const statItems = document.querySelectorAll('.stat-item h3');
  if (statItems.length > 0) {
    const observerConfig = {
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerConfig);
    
    statItems.forEach(item => observer.observe(item));
  }

  // ========== TESTIMONIAL CAROUSEL ==========
  // Grid responsive untuk testimonials, dapat ditingkatkan dengan gesture di mobile
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  if (testimonialCards.length > 0) {
    testimonialCards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        this.style.animationPlayState = 'running';
      });
    });
  }
});

