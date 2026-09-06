window.addEventListener("load", () => {
  const storageKey = 'floating_promo_shown_time';
  const resetInterval = 3 * 60 * 60 * 1000; // 3 jam

  const timestamp = localStorage.getItem(storageKey);
  if (timestamp) {
    const elapsedTime = Date.now() - parseInt(timestamp);
    if (elapsedTime < resetInterval) {
      return; // Sembunyikan jika belum 3 jam
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  const promoHTML = `
    <div id="floatingPromo" class="floating-promo-container">
      <button id="floatingPromoClose" class="promo-widget-close" aria-label="Tutup Promo" title="Tutup">
        <i class="fas fa-times"></i>
      </button>
      <a href="/promo/" id="floatingPromoLink" class="promo-widget-card" aria-label="Lihat Promo">
        <!-- Realistic Product Tag Hardware -->
        <div class="promo-widget-hardware">
          <svg class="promo-widget-string" width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Twine loop hanging off to the left -->
            <path d="M32,44 C20,30 0,20 15,5 C25,-5 45,15 32,38" stroke="#D4A373" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Twine knot and dangle -->
            <path d="M32,44 C35,50 25,55 28,60" stroke="#D4A373" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <div class="promo-widget-eyelet"></div>
        </div>

        <div class="promo-widget-icon">
          <i class="fas fa-bullhorn icon-megaphone"></i>
          <div class="sound-waves">
            <span class="wave w1"></span>
            <span class="wave w2"></span>
            <span class="wave w3"></span>
          </div>
          <div class="promo-widget-badges">
            <span class="badge-label promo">PROMO</span>
            <span class="badge-label terbaru">TERBARU</span>
          </div>
        </div>
        <div class="promo-widget-content">
          <div class="promo-widget-value">
            Diskon 10%
          </div>
          <div class="promo-widget-desc">
            Untuk pengguna baru
          </div>
        </div>
      </a>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', promoHTML);

  // Menerapkan efek gelombang per huruf untuk teks promo
  ['.promo-widget-value', '.promo-widget-desc'].forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      el.innerHTML = el.textContent.trim().split('').map((char, i) => 
        `<span style="--char-index: ${i}; display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
    }
  });
  
  const styles = ["/assets/css/components/floating-promo.css"];
  styles.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });

  const promoWidget = document.getElementById('floatingPromo');
  
  if (promoWidget) {
    const hideFloatingPromo = (e) => {
      // Menyimpan waktu ditutup (cooldown 3 jam)
      localStorage.setItem(storageKey, Date.now().toString());
      
      // Jika yang diklik adalah tombol close, sembunyikan dengan animasi
      if (e.currentTarget.id === 'floatingPromoClose') {
        promoWidget.style.opacity = '0';
        promoWidget.style.pointerEvents = 'none';
        promoWidget.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(() => promoWidget.remove(), 400);
      }
    };

    document.getElementById('floatingPromoClose').addEventListener('click', hideFloatingPromo);
    document.getElementById('floatingPromoLink').addEventListener('click', hideFloatingPromo);

    setTimeout(() => {
      promoWidget.classList.add('show');
    }, 1000);
  }
});
