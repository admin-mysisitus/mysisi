/* ========== PROMO PAGE INTERACTIONS ========== */

document.addEventListener('DOMContentLoaded', function () {
  // ========== SMOOTH SCROLL KE PROMO DETAILS ==========
  const smoothScrollLinks = document.querySelectorAll('a[href="#promo-details"]');
  
  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector('#promo-details');
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Intersection Observer untuk animation reveal sudah ditangani CSS

  // CTA Button analytics dapat ditambah di tracker analytics terpisah

  // ========== FEATURED CARD HIGHLIGHT PADA LOAD ==========
  const featuredCard = document.querySelector('.promo-card.featured');
  if (featuredCard) {
    // Memberikan slight glow effect pada featured card saat page load
    featuredCard.style.transition = 'all 0.3s ease-in-out';
  }

  // ========== RESPONSIVE PROMO CARD HOVER ==========
  // Disable hover effect di touch devices
  const isTouch = () => {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  };

  if (!isTouch()) {
    const promoCards = document.querySelectorAll('.promo-card');
    
    promoCards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        this.style.willChange = 'transform';
      });

      card.addEventListener('mouseleave', function () {
        this.style.willChange = 'auto';
      });
    });
  }

  // ========== WHY ITEMS ICON ANIMATION (via CSS hover) ==========
  // Icon animation sekarang di-handle oleh CSS .why-item:hover i
  // Tidak perlu JavaScript intervention untuk hover animation

  // ========== COUNTER ANIMATION (OPTIONAL untuk statistik jika ada) ==========
  // Bisa ditambahkan jika ada section dengan angka-angka
  const animateCounter = (element, target, duration = 2000) => {
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  };

  // ========== DYNAMIC PROMO CARD STAGGER ANIMATION ==========
  // Memastikan animation timing yang smooth
  const staggerCards = () => {
    const cards = document.querySelectorAll('.promo-card');
    cards.forEach((card, index) => {
      card.style.setProperty('--delay', `${index * 100}ms`);
    });
  };

  staggerCards();

  // ========== ACCESSIBILITY: FOCUS MANAGEMENT ==========
  const allButtons = document.querySelectorAll('.btn');
  
  allButtons.forEach(button => {
    button.addEventListener('focus', function () {
      this.style.outline = '2px solid var(--hijau-muda)';
      this.style.outlineOffset = '2px';
    });

    button.addEventListener('blur', function () {
      this.style.outline = 'none';
    });
  });

  // ========== PROMO COUNTDOWN TIMER ==========
  const PROMO_END_DATE = new Date('2026-03-31T23:59:59+07:00').getTime();
  const UPDATE_INTERVAL = 1000; // Update every 1 second

  const countdownContainer = document.getElementById('promo-countdown');
  const daysElement = document.getElementById('countdown-days');
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');
  const secondsElement = document.getElementById('countdown-seconds');

  function calculateTimeRemaining() {
    const now = new Date().getTime();
    const timeRemaining = PROMO_END_DATE - now;

    if (timeRemaining <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      isExpired: false
    };
  }

  function updateCountdown() {
    if (!countdownContainer) return;

    const time = calculateTimeRemaining();

    // Update DOM
    daysElement.textContent = String(time.days).padStart(2, '0');
    hoursElement.textContent = String(time.hours).padStart(2, '0');
    minutesElement.textContent = String(time.minutes).padStart(2, '0');
    secondsElement.textContent = String(time.seconds).padStart(2, '0');

    // Add warning class if less than 24 hours
    if (time.days === 0 && time.hours <= 6) {
      countdownContainer.classList.add('countdown-urgent');
    }

    // If promo expired, show message
    if (time.isExpired) {
      countdownContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #fef3cd; border-radius: 8px;">
          <strong style="color: #856404;">Promo telah berakhir</strong>
          <p style="margin: 8px 0 0; font-size: 0.9em; color: #856404;">
            Terima kasih telah berminat! Tunggu promo berikutnya atau hubungi kami untuk penawaran khusus.
          </p>
        </div>
      `;
      if (window.promoCountdownInterval) {
        clearInterval(window.promoCountdownInterval);
      }
    }
  }

  // Initialize countdown timer
  if (countdownContainer) {
    updateCountdown();
    window.promoCountdownInterval = setInterval(updateCountdown, UPDATE_INTERVAL);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (window.promoCountdownInterval) {
        clearInterval(window.promoCountdownInterval);
      }
    });
  }
});
