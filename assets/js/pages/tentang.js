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

  // ========== UTILITY FUNCTIONS ==========
  function isTouch() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
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
