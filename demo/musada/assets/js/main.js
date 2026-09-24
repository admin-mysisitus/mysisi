function initScrollAnimations() { var animatedElements = document.querySelectorAll('.animate-on-scroll'); if (animatedElements.length === 0) return; var observer = new IntersectionObserver(function (entries, observer) { entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); setTimeout(function () { entry.target.classList.remove('animate-on-scroll', 'is-visible', 'anim-fade-up', 'anim-fade-down', 'anim-fade-left', 'anim-fade-right', 'anim-zoom-in', 'anim-zoom-out', 'delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700', 'delay-800') }, 1500) } }) }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 }); animatedElements.forEach(function (el) { observer.observe(el) }) }
function initClock() { var clockEls = document.querySelectorAll('.current-datetime-display'); if (clockEls.length === 0) return; var days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']; var months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER']; function updateClock() { var now = new Date(); var day = days[now.getDay()]; var date = now.getDate(); var month = months[now.getMonth()]; var year = now.getFullYear(); var h = String(now.getHours()).padStart(2, '0'); var m = String(now.getMinutes()).padStart(2, '0'); var s = String(now.getSeconds()).padStart(2, '0'); var str = day + ', ' + date + ' ' + month + ' ' + year + ', ' + h + ':' + m + ':' + s; clockEls.forEach(function(el) { el.innerText = str }) } updateClock(); setInterval(updateClock, 1000) }
function initHeroSlider() {
  var slider = document.getElementById('heroSlider'); if (!slider) return; var slides = slider.querySelectorAll('.hero-image'); var prevBtn = document.getElementById('prevSlide'); var nextBtn = document.getElementById('nextSlide'); var currentSlide = 0; var slideCount = slides.length; var slideInterval; if (slideCount === 0) return; function goToSlide(index) { slides[currentSlide].classList.remove('slide-active'); currentSlide = (index + slideCount) % slideCount; slides[currentSlide].classList.add('slide-active') }
  function nextSlide() { goToSlide(currentSlide + 1) }
  function prevSlide() { goToSlide(currentSlide - 1) }
  function startSlide() { slideInterval = setInterval(nextSlide, 5000) }
  function resetInterval() { clearInterval(slideInterval); startSlide() }
  if (prevBtn) { prevBtn.addEventListener('click', function () { prevSlide(); resetInterval() }) }
  if (nextBtn) { nextBtn.addEventListener('click', function () { nextSlide(); resetInterval() }) }
  var touchStartX = 0; var touchEndX = 0; slider.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX }, { passive: !0 }); slider.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX; var swipeThreshold = 50; if (touchEndX < touchStartX - swipeThreshold) { nextSlide(); resetInterval() }
    if (touchEndX > touchStartX + swipeThreshold) { prevSlide(); resetInterval() }
  }, { passive: !0 }); startSlide()
}
window.initHeroSlider = initHeroSlider; function initBackToTop() { var backToTopBtn = document.getElementById('backToTop'); if (!backToTopBtn) return; window.addEventListener('scroll', function () { if (window.scrollY > 300) { backToTopBtn.classList.add('show') } else { backToTopBtn.classList.remove('show') } }, { passive: !0 }); backToTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }) }) }
window.initBackToTop = initBackToTop; function initDarkMode() {
  var toggleBtns = document.querySelectorAll('.dark-mode-toggle'); var storedTheme = localStorage.getItem('theme'); if (storedTheme === 'dark') { document.documentElement.classList.add('dark-mode') }
  toggleBtns.forEach(function(btn) { btn.addEventListener('click', function () { document.documentElement.classList.toggle('dark-mode'); var isDark = document.documentElement.classList.contains('dark-mode'); localStorage.setItem('theme', isDark ? 'dark' : 'light') }) })
}
window.initDarkMode = initDarkMode;

function initNumberCounters() {
  var counters = document.querySelectorAll('.stat-number');
  if (counters.length === 0) return;
  var observer = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var targetValue = parseInt(el.getAttribute('data-target'), 10);
        if (!isNaN(targetValue)) {
          var duration = 2000;
          var start = null;
          function step(timestamp) {
            if (!start) start = timestamp;
            var progress = timestamp - start;
            var current = Math.min(Math.floor((progress / duration) * targetValue), targetValue);
            el.innerText = current;
            if (progress < duration) {
              window.requestAnimationFrame(step);
            } else {
              el.innerText = targetValue;
            }
          }
          window.requestAnimationFrame(step);
        }
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  counters.forEach(function(el) {
    var text = el.innerText.trim();
    if (text) {
      el.setAttribute('data-target', text);
      el.innerText = '0';
      observer.observe(el);
    }
  });
}
window.initNumberCounters = initNumberCounters;

function initSponsorsMarquee() {
  const template = document.getElementById("sponsors-template");
  const row1 = document.getElementById("row1");
  const row2 = document.getElementById("row2");
  if (template && row1 && row2) {
    const trackTemplate = template.content.querySelector(".sponsors-track");
    if (trackTemplate) {
      const allLogos = Array.from(trackTemplate.querySelectorAll('img'));
      const halfIndex = Math.ceil(allLogos.length / 2);
      const logos1 = allLogos.slice(0, halfIndex).map(img => img.outerHTML).join('');
      const logos2 = allLogos.slice(halfIndex).map(img => img.outerHTML).join('');
      const track1 = document.createElement('div');
      track1.className = 'sponsors-track scroll-left';
      track1.innerHTML = logos1.repeat(6);
      const track2 = document.createElement('div');
      track2.className = 'sponsors-track scroll-right';
      track2.innerHTML = logos2.repeat(6);
      row1.appendChild(track1);
      row2.appendChild(track2);
    }
  }
}
window.initSponsorsMarquee = initSponsorsMarquee;

function initGallerySlider() {
  var sliders = document.querySelectorAll('.auto-slide-gallery, #gallery-slider');
  if (!sliders.length) return;

  sliders.forEach(function(slider) {
    if (slider.dataset.autoSliderInitialized === 'true') return;
    slider.dataset.autoSliderInitialized = 'true';

    var scrollInterval;
    var pauseTimeout;

    function getScrollAmount() {
      var firstItem = slider.querySelector('.gallery-item-home');
      if (!firstItem) return 0;

      var itemStyle = window.getComputedStyle(firstItem);
      var itemWidth = firstItem.offsetWidth + parseFloat(itemStyle.marginRight || 0);
      var gap = parseFloat(window.getComputedStyle(slider).gap || 0);
      return itemWidth + gap;
    }

    function scrollStep() {
      var maxScroll = slider.scrollWidth - slider.clientWidth - 10;
      if (maxScroll <= 0 || slider.scrollLeft >= maxScroll) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    }

    function startAutoScroll() {
      clearInterval(scrollInterval);
      scrollInterval = setInterval(scrollStep, 2200);
    }

    function pauseAutoScroll() {
      clearInterval(scrollInterval);
      clearTimeout(pauseTimeout);
    }

    function resumeAutoScroll() {
      pauseAutoScroll();
      pauseTimeout = setTimeout(startAutoScroll, 1800);
    }

    slider.addEventListener('mouseenter', pauseAutoScroll);
    slider.addEventListener('mouseleave', resumeAutoScroll);
    slider.addEventListener('touchstart', pauseAutoScroll, { passive: true });
    slider.addEventListener('touchend', resumeAutoScroll, { passive: true });

    startAutoScroll();
  });
}
window.initGallerySlider = initGallerySlider;

function initInfografisSliders() {
  var sliders = document.querySelectorAll('.infografis-slider');
  if (!sliders.length) return;

  sliders.forEach(function(slider) {
    var slides = slider.querySelectorAll('.infografis-slide');
    if (slides.length < 2) return;

    var currentIndex = 0;
    var intervalMs = Number(slider.dataset.interval) || 2600;

    function showSlide(index) {
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }

    var intervalId = setInterval(nextSlide, intervalMs);

    slider.addEventListener('mouseenter', function() {
      clearInterval(intervalId);
    });

    slider.addEventListener('mouseleave', function() {
      intervalId = setInterval(nextSlide, intervalMs);
    });
  });
}
window.initInfografisSliders = initInfografisSliders;
