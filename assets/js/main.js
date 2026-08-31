/* ========== IMPORT SEMUA FILE JS ========== */
// Components
import './components/navigation.js';
import './components/preloader.js';
import './components/live-chat.js';
import './components/custom-font.js';
import './components/date-time.js';
import './components/hero.js';
import './components/section-animation.js';
import './components/popup-promo.js';
// wm
import './wm.js';
// ========== DYNAMIC PRICING HIDER ==========
// Dynamically hide inactive packages across all static HTML pages
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
            el.style.display = 'none'; // Hide inactive packages
          }
        });
      }
    } catch (err) {
      console.log('Could not verify package active status:', err);
    }
  }
});