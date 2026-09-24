document.addEventListener('DOMContentLoaded', function () {
  var preloader = document.createElement('div');
  preloader.id = 'app-preloader';
  if (localStorage.getItem('theme') === 'dark') {
      preloader.classList.add('dark-mode-preloader');
  }
  preloader.innerHTML = '<div class="mobile-animation-logo-inner"><div class="baris-atas"><div class="biru-elegan"><span class="sd-besar">SD</span><span class="muhammadiyah">MUHAMMADIYAH</span><span class="sedati">SEDATI</span></div><div class="angka-satu">1</div></div><div class="merah">“ISLAMIC MODERN SCHOOL”</div></div>';
  document.body.prepend(preloader);

  function buildRelativePath(targetPath, currentPathname) {
    var normalizedCurrent = currentPathname.split('?')[0].split('#')[0] || '/';
    var currentDir = normalizedCurrent.endsWith('/') ? normalizedCurrent : normalizedCurrent.substring(0, normalizedCurrent.lastIndexOf('/') + 1);
    var currentSegments = currentDir.split('/').filter(Boolean);
    var targetSegments = targetPath.split('/').filter(Boolean);
    var commonLength = 0;

    while (
      commonLength < currentSegments.length &&
      commonLength < targetSegments.length &&
      currentSegments[commonLength] === targetSegments[commonLength]
    ) {
      commonLength++;
    }

    var upLevels = Math.max(0, currentSegments.length - commonLength);
    var downSegments = targetSegments.slice(commonLength);
    return Array(upLevels + 1).join('../') + downSegments.join('/');
  }

  function normalizeHtmlUrls(html) {
    return html.replace(/(href|src)=(["'])(\/[^"']+)(["'])/g, function (match, attrName, quote, targetPath, endQuote) {
      var relativePath = buildRelativePath(targetPath, window.location.pathname);
      return attrName + '=' + quote + relativePath + endQuote;
    });
  }

  function resolveCandidates(relativeUrl) {
    var normalized = relativeUrl.replace(/^\/+/, '');
    var candidates = [];
    var currentPath = window.location.pathname.split('?')[0].split('#')[0] || '/';
    var currentDir = currentPath.endsWith('/') ? currentPath : currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    var segments = currentDir.split('/').filter(Boolean);

    for (var i = 0; i <= segments.length; i++) {
      candidates.push(Array(i + 1).join('../') + normalized);
    }

    candidates.push('./' + normalized);
    candidates.push('/' + normalized);

    var uniqueCandidates = [];
    candidates.forEach(function (candidate) {
      if (uniqueCandidates.indexOf(candidate) === -1) {
        uniqueCandidates.push(candidate);
      }
    });

    return uniqueCandidates;
  }

  function fetchWithFallback(candidates) {
    var index = 0;

    function tryNext() {
      if (index >= candidates.length) {
        return Promise.reject(new Error('All component URL candidates failed.'));
      }

      var url = candidates[index];
      index += 1;

      return fetch(url).then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load ' + url);
        }
        return response;
      }).catch(function () {
        return tryNext();
      });
    }

    return tryNext();
  }

  var baseUrl = './';
  var loadComponent = function (id, url) {
    var el = document.getElementById(id);
    if (!el) return Promise.resolve();

    var candidates = resolveCandidates(url);

    return fetchWithFallback(candidates)
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var processedHtml = html.replace(/\{BASE_URL\}/g, baseUrl);
        var normalizedHtml = normalizeHtmlUrls(processedHtml);
        el.outerHTML = normalizedHtml;
      })
      .catch(function (error) {
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
    wmScript.src = buildRelativePath('/assets/js/components/wm.js', window.location.pathname);
    document.body.appendChild(wmScript);

    setTimeout(function () {
      var preloader = document.getElementById('app-preloader');
      if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(function () {
          preloader.remove();
        }, 600);
      }
    }, 1500);
  });
});
