/* ========== PERUSAHAAN PAGE INTERACTIONS ========== */
/* Import common interactions dan tambahkan logic spesifik perusahaan */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  
  // ========== STAT COUNTER ANIMATION ==========
  const statsSection = document.querySelector('.company-stats-section');
  const statBoxes = document.querySelectorAll('.stat-box');
  let hasAnimated = false;

  const animateStats = () => {
    if (hasAnimated || !statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statBoxes.forEach(box => {
            const h3 = box.querySelector('h3');
            if (!h3) return;

            const text = h3.textContent.trim();
            const numMatch = text.match(/(\d+)/);
            
            if (!numMatch) return;

            const finalValue = numMatch[1];
            const isPercentage = text.includes('%');
            const finalNum = parseInt(finalValue);
            let currentNum = 0;
            const increment = Math.ceil(finalNum / 30);
            const duration = 1000;
            const stepTime = duration / (finalNum / increment);

            const counter = setInterval(() => {
              currentNum += increment;
              if (currentNum >= finalNum) {
                currentNum = finalNum;
                clearInterval(counter);
              }
              const display = isPercentage 
                ? currentNum + '%' 
                : (text.includes('+') ? currentNum + '+' : currentNum);
              h3.textContent = display;
            }, stepTime);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  };

  animateStats();

  // ========== NAVIGATE CARDS INTERACTION ==========
  const navigateCards = document.querySelectorAll('.navigate-card');
  
  navigateCards.forEach(card => {
    // Hover effect for desktop
    card.addEventListener('mouseenter', function () {
      this.style.transition = 'none';
      const icon = this.querySelector('i');
      if (icon) {
        icon.style.animation = 'none';
        setTimeout(() => {
          icon.style.animation = 'pulse 0.6s ease-in-out';
        }, 10);
      }
    });

    card.addEventListener('mouseleave', function () {
      const icon = this.querySelector('i');
      if (icon) {
        icon.style.animation = 'none';
      }
    });

    // Click feedback for mobile
    card.addEventListener('click', function (e) {
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
      card.addEventListener('mouseenter', function () {
        icon.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        icon.style.transform = 'scale(1.25) rotate(10deg)';
      });

      card.addEventListener('mouseleave', function () {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
    }
  });

  // ========== VALUE ITEMS ICON ANIMATION ==========
  const valueItems = document.querySelectorAll('.value-item');
  
  valueItems.forEach(item => {
    const valueIcon = item.querySelector('.value-icon');
    
    if (valueIcon) {
      item.addEventListener('mouseenter', function () {
        valueIcon.style.animation = 'bounce 0.6s ease-in-out';
      });

      item.addEventListener('mouseleave', function () {
        valueIcon.style.animation = 'none';
      });
    }
  });

  // ========== CTA BUTTONS INTERACTION ==========
  // Auto-initialized by HeroComponent.initAll() - no manual setup needed
  // CTA buttons akan mendapatkan hover effects, animations, dan ripple effect secara otomatis

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
