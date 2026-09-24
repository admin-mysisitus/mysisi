document.addEventListener('DOMContentLoaded', function () {
  // Inject Preloader
  var preloader = document.createElement('div');
  preloader.id = 'app-preloader';
  if (localStorage.getItem('theme') === 'dark') {
      preloader.classList.add('dark-mode-preloader');
  }
  preloader.innerHTML = '<div class="mobile-animation-logo-inner"><div class="baris-atas"><div class="biru-elegan"><span class="sd-besar">SD</span><span class="muhammadiyah">MUHAMMADIYAH</span><span class="sedati">SEDATI</span></div><div class="angka-satu">1</div></div><div class="merah">“ISLAMIC MODERN SCHOOL”</div></div>';
  document.body.prepend(preloader);

  var baseUrl = '/'; var loadComponent = function (id, url) { var el = document.getElementById(id); if (!el) return Promise.resolve(); return fetch('/' + url + '').then(function (response) { if (!response.ok) throw new Error('Failed to load ' + url); return response.text() }).then(function (html) { var processedHtml = html.replace(/\{BASE_URL\}/g, baseUrl); el.outerHTML = processedHtml }).catch(function (error) { console.error('Error loading component:', error) }) }; Promise.all([loadComponent('app-header', 'components/header.html'), loadComponent('app-hero', 'components/hero.html'), loadComponent('app-sidebar', 'components/sidebar.html'), loadComponent('app-footer', 'components/footer.html')]).then(function () {
    if (typeof initNavigation === 'function') { initNavigation() }
    if (typeof initClock === 'function') { initClock() }
    if (typeof initHeroSlider === 'function') { initHeroSlider() }
    if (typeof initScrollAnimations === 'function') { initScrollAnimations() }
    if (typeof initNumberCounters === 'function') { initNumberCounters() }
    if (typeof initBackToTop === 'function') { initBackToTop() }
    if (typeof initDarkMode === 'function') { initDarkMode() }
    if (typeof initSponsorsMarquee === 'function') { initSponsorsMarquee() }
    if (typeof initGallerySlider === 'function') { initGallerySlider() }
    if (typeof initInfografisSliders === 'function') { initInfografisSliders() }
    var wmScript = document.createElement('script'); wmScript.src = '/' + 'assets/js/components/wm.js'; document.body.appendChild(wmScript)
    
    // Fade out preloader
    setTimeout(function() {
        preloader.classList.add('fade-out');
        setTimeout(function() {
            preloader.remove();
        }, 600); // Wait for transition to finish
    }, 1500); // Show for at least 1.5s to let the logo bounce animation complete
  })
})
