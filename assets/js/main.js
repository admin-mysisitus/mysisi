import './components/navigation.js';
import './components/preloader.js';
import './components/live-chat.js';
import './components/custom-font.js';
import './components/date-time.js';
import './components/hero.js';
import './components/section-animation.js';
import './components/popup-promo.js';
import './components/floating-promo.js';
import './components/bottom-cta.js';
import './wm.js';
document.addEventListener('DOMContentLoaded', async () => {
  const packageElements = document.querySelectorAll('[data-package]');
  if (packageElements.length > 0) {
    try {
      const APIClient = (await import('./modules/unified-api.js')).default;
      const configRes = await APIClient.fetchPricingConfig();
      if (configRes.success && configRes.data && configRes.data.packages) {
        packageElements.forEach(el => {
          const pkgId = el.getAttribute('data-package').toLowerCase();
          const pkg = configRes.data.packages[pkgId];
          if (pkg && pkg.active === false) {
            el.style.display = 'none';
          }
        });
      }
    } catch (err) {
      void('Could not verify package active status:', err);
    }
  }

  // Add Dynamic WhatsApp Greeting
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="wa.me/62882010067695"]');
    if (a) {
      const hour = new Date().getHours();
      let greeting = 'malam';
      if (hour >= 4 && hour < 11) greeting = 'pagi';
      else if (hour >= 11 && hour < 15) greeting = 'siang';
      else if (hour >= 15 && hour < 18) greeting = 'sore';
      
      const url = new URL(a.href);
      let currentText = url.searchParams.get('text') || '';
      
      // Clean up previous dynamic greetings if link was already clicked
      currentText = currentText.replace(/^Halo\s+Sisitus!\s+Selamat\s+(pagi|siang|sore|malam),\s*/ig, '');
      currentText = currentText.replace(/^Halo\s+SISITUS(,\s*)?/ig, '');
      currentText = currentText.replace(/^Halo\s+SISITUS\s+SISITUS(,\s*)?/ig, '');
      
      if (!currentText || currentText.trim().toLowerCase() === 'saya ingin info penawaran produk') {
        currentText = 'saya ingin info penawaran produk.';
      } else {
        currentText = currentText.charAt(0).toLowerCase() + currentText.slice(1);
      }
      
      url.searchParams.set('text', `Halo Sisitus! Selamat ${greeting}, ${currentText}`);
      a.href = url.toString();
    }
  });
});