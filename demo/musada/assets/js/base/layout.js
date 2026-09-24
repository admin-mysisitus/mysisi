document.addEventListener('DOMContentLoaded', function () {
  var siteSegments = window.location.pathname.split('/').filter(Boolean);
  var musadaIndex = siteSegments.lastIndexOf('musada2');
  if (musadaIndex === -1) {
    musadaIndex = siteSegments.lastIndexOf('musada');
  }

  var baseUrl = './';
  if (musadaIndex !== -1) {
    var depthFromRoot = Math.max(siteSegments.length - musadaIndex - 1, 0);
    baseUrl = Array(depthFromRoot + 1).join('../');
  }
  if (!baseUrl) {
    baseUrl = './';
  }

  var normalizeUrl = function (url) {
    if (!url || /^https?:\/\//i.test(url) || /^\/\//.test(url) || /^mailto:/i.test(url) || /^javascript:/i.test(url) || /^#/.test(url) || /^data:/i.test(url)) {
      return url;
    }

    if (url.charAt(0) === '/') {
      return baseUrl + url.replace(/^\/+/, '');
    }

    return url;
  };

  var normalizeHtmlAttributeUrls = function (html) {
    return html
      .replace(/(href|src)=['"]\/([^'"]+)['"]/g, function (match, attr, value) {
        return attr + '="' + normalizeUrl('/' + value) + '"';
      })
      .replace(/(content)=['"]0;\s*url=\/([^'"]+)['"]/gi, function (match, attr, value) {
        return attr + '="0; url=' + normalizeUrl('/' + value) + '"';
      });
  };

  // Inject Preloader
  var preloader = document.createElement('div');
  preloader.id = 'app-preloader';
  if (localStorage.getItem('theme') === 'dark') {
      preloader.classList.add('dark-mode-preloader');
  }
  preloader.innerHTML = '<div class="mobile-animation-logo-inner"><div class="baris-atas"><div class="biru-elegan"><span class="sd-besar">SD</span><span class="muhammadiyah">MUHAMMADIYAH</span><span class="sedati">SEDATI</span></div><div class="angka-satu">1</div></div><div class="merah">“ISLAMIC MODERN SCHOOL”</div></div>';
  document.body.prepend(preloader);

  var loadComponent = function (id, url) {
    var el = document.getElementById(id);
    if (!el) return Promise.resolve();
    return fetch(baseUrl + url).then(function (response) {
      if (!response.ok) throw new Error('Failed to load ' + url);
      return response.text();
    }).then(function (html) {
      var processedHtml = normalizeHtmlAttributeUrls(html.replace(/\{BASE_URL\}/g, baseUrl));
      el.outerHTML = processedHtml;
    }).catch(function (error) {
      console.error('Error loading component:', error);
    });
  };

  Promise.all([
    loadComponent('app-header', 'components/header.html'),
    loadComponent('app-hero', 'components/hero.html'),
    loadComponent('app-sidebar', 'components/sidebar.html'),
    loadComponent('app-footer', 'components/footer.html')
  ]).then(function () {
    if (typeof initNavigation === 'function') { initNavigation(); }
    if (typeof initClock === 'function') { initClock(); }
    if (typeof initHeroSlider === 'function') { initHeroSlider(); }
    if (typeof initScrollAnimations === 'function') { initScrollAnimations(); }
    if (typeof initNumberCounters === 'function') { initNumberCounters(); }
    if (typeof initBackToTop === 'function') { initBackToTop(); }
    if (typeof initDarkMode === 'function') { initDarkMode(); }
    if (typeof initSponsorsMarquee === 'function') { initSponsorsMarquee(); }
    if (typeof initGallerySlider === 'function') { initGallerySlider(); }
    if (typeof initInfografisSliders === 'function') { initInfografisSliders(); }

    var wmScript = document.createElement('script');
    wmScript.src = normalizeUrl('/assets/js/components/wm.js');
    document.body.appendChild(wmScript);

    setTimeout(function () {
      preloader.classList.add('fade-out');
      setTimeout(function () {
        preloader.remove();
      }, 600);
    }, 1500);
  });
});
