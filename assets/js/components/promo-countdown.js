/**
 * Promo Countdown Timer Component
 * Displays a real-time countdown to the promo end date (31 March 2026, 23:59:59 WIB)
 * 
 * Usage: Include script in HTML footer
 * <script src="/assets/js/components/promo-countdown.js" defer></script>
 */

(function() {
  'use strict';

  // Configuration
  const PROMO_END_DATE = new Date('2026-03-31T23:59:59+07:00').getTime();
  const UPDATE_INTERVAL = 1000; // Update every 1 second

  // DOM Elements
  const countdownContainer = document.getElementById('promo-countdown');
  const daysElement = document.getElementById('countdown-days');
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');
  const secondsElement = document.getElementById('countdown-seconds');

  /**
   * Calculate time remaining
   */
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

  /**
   * Update countdown display
   */
  function updateCountdown() {
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
      clearInterval(timerInterval);
    }
  }

  /**
   * Initialize countdown timer
   */
  function init() {
    // Only initialize if countdown container exists
    if (!countdownContainer) {
      console.warn('Countdown container not found. Skipping initialization.');
      return;
    }

    // Initial update
    updateCountdown();

    // Set interval for updates
    window.timerInterval = setInterval(updateCountdown, UPDATE_INTERVAL);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (window.timerInterval) {
        clearInterval(window.timerInterval);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
