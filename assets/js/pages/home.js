/* ========== HOME PAGE INTERACTIONS ========== */
document.addEventListener('DOMContentLoaded', function () {
  // ========== SPECIFIC HOME PAGE LOGIC ==========
  // FAQ functionality is now handled by faq.js component
  // ========== SERVICE CARD FEATURES TOGGLE (POPUP) ==========
  const toggleButtons = document.querySelectorAll('.toggle-features');
  if (toggleButtons.length > 0) {
    toggleButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const featuresList = this.nextElementSibling;
        const card = this.closest('.service-card');
        const packageName = card.querySelector('.card-header h3').innerText;
        // Buat kloningan list fitur untuk ditampilkan di popup
        const cloneList = featuresList.cloneNode(true);
        cloneList.removeAttribute('hidden');
        cloneList.style.display = 'block';
        cloneList.style.textAlign = 'left';
        cloneList.style.fontSize = '0.9rem'; // Mengecilkan ukuran font
        cloneList.style.padding = '0';
        cloneList.style.margin = '0';
        // Membungkus isi teks ke dalam span agar tidak pecah oleh flexbox
        Array.from(cloneList.children).forEach(li => {
          const icon = li.querySelector('i');
          if (icon) {
            // Ambil semua node selain icon
            const contentNodes = Array.from(li.childNodes).filter(n => n !== icon);
            const span = document.createElement('span');
            contentNodes.forEach(n => span.appendChild(n));
            li.innerHTML = '';
            li.appendChild(icon);
            li.appendChild(span);
          }
        });
        Swal.fire({
          title: `Fitur ${packageName}`,
          html: cloneList.outerHTML,
          width: '360px',
          padding: '1.5rem',
          confirmButtonText: 'Tutup',
          confirmButtonColor: 'var(--primary-blue)',
          customClass: {
            title: 'swal-title-compact',
            popup: 'pricing-features-popup'
          }
        });
      });
    });
  }
  // ========== STATS COUNTER ANIMATION ==========
  const statsSection = document.querySelector('.stats-section');
  const statItems = document.querySelectorAll('.stat-text-item');
  let hasAnimated = false;
  const animateStats = () => {
    if (hasAnimated || !statsSection) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statItems.forEach(box => {
            const h3 = box.querySelector('h3');
            if (!h3) return;
            const text = h3.textContent.trim();
            const numMatch = text.match(/(\d+)/);
            if (!numMatch) return;
            const finalValue = numMatch[1];
            const isPercentage = text.includes('%');
            const hasPlus = text.includes('+');
            const finalNum = parseInt(finalValue);
            let currentNum = 0;
            const increment = Math.ceil(finalNum / 30);
            const duration = 1000;
            const stepTime = duration / (finalNum / increment);
            const counter = setInterval(() => {
              currentNum += increment;
              if (currentNum >= finalNum) {
                currentNum = finalNum;
                clearInterval(counter);
              }
              const display = isPercentage ? currentNum + '%' : (hasPlus ? currentNum + '+' : currentNum);
              h3.textContent = display;
            }, stepTime);
          });
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.5
    });
    observer.observe(statsSection);
  };
  animateStats();
  // ========== TESTIMONIAL CAROUSEL ==========
  // Grid responsive untuk testimonials, dapat ditingkatkan dengan gesture di mobile
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  if (testimonialCards.length > 0) {
    testimonialCards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        this.style.animationPlayState = 'running';
      });
    });
  }

  // ========== INSTAGRAM EMBED LOGIC ==========
  const igData = {
    "username": "sisitusdotcom",
    "nama_lengkap": "SINTARA TECH",
    "pengikut": "2,8 rb pengikut",
    "kiriman": "30 kiriman",
    "ada_story": true,
    "foto_profil": "assets/img/logo/logo.svg",
    "kiriman_grid": [
      { "url": "assets/img/blog/tips/conversion-rate-optimization.webp", "tipe": "" },
      { "url": "assets/img/blog/tips/email-marketing.webp", "tipe": "" },
      { "url": "assets/img/blog/tips/mobile-first-design.webp", "tipe": "is-video" },
      { "url": "assets/img/blog/tips/seo-on-page.webp", "tipe": "" },
      { "url": "assets/img/blog/tips/strategi-content-marketing.webp", "tipe": "is-carousel" },
      { "url": "assets/img/blog/tips/trend-desain-website-2025.webp", "tipe": "is-video" }
    ]
  };

  const l = document.getElementById("tautan");
  if (l) {
    l.addEventListener("click", e => {
      e.preventDefault();
      const u = igData.username;
      location.href = `instagram://user?username=${u}`;
      setTimeout(() => open(`https://instagram.com/${u}`, "_blank", "noopener,noreferrer"), 800);
    });
  }

  const txtNama = document.getElementById("txt-nama");
  if (txtNama) txtNama.textContent = `@${igData.username}`;

  const txtUser = document.getElementById("txt-user");
  if (txtUser) {
    txtUser.innerHTML = igData.username + `<svg class="ig-verified-icon" fill="#0095f6" viewBox="0 0 40 40"><path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"/></svg>`;
  }

  const txtNamaLengkap = document.getElementById("txt-namalengkap");
  if (txtNamaLengkap) txtNamaLengkap.textContent = igData.nama_lengkap;

  const txtFollow = document.getElementById("txt-follow");
  if (txtFollow) txtFollow.textContent = igData.pengikut;

  const txtPost = document.getElementById("txt-post");
  if (txtPost) txtPost.textContent = igData.kiriman;

  const foto = document.getElementById("foto");
  if (foto) foto.src = igData.foto_profil;

  const bawahFoto = document.getElementById("bawah-foto");
  if (bawahFoto) bawahFoto.classList.toggle("no-story", !igData.ada_story);

  const g = document.getElementById("grid");
  if (g && igData.kiriman_grid) {
    igData.kiriman_grid.forEach(p => {
      let ic = "";
      if (p.tipe === "is-video") ic = `<svg class="media-icon media-video-icon" viewBox="0 0 24 24"><path d="M8.55 4.75C7.15 3.95 5.45 4.95 5.45 6.55V17.45C5.45 19.05 7.15 20.05 8.55 19.25L17.35 13.85C18.75 13 18.75 11 17.35 10.15Z" fill="#fff"/></svg>`;
      else if (p.tipe === "is-carousel") ic = `<svg class="media-icon media-carousel-icon" viewBox="0 0 48 48"><path d="M34.8 29.2V11.4C34.8 8.3 32.5 6 29.4 6H11.4C8.3 6 6 8.3 6 11.4V29.2C6 32.3 8.3 34.6 11.4 34.6H29.4C32.5 34.6 34.8 32.3 34.8 29.2ZM37.2 14.8V30.8C37.2 34.4 34.4 37.2 30.8 37.2H14.8c-.65 0-1.2.5-1.2 1.15 0 .65.55 1.2 1.2 1.2h16c4.85 0 8.75-3.9 8.75-8.75V14.8c0-.65-.55-1.2-1.2-1.2s-1.15.55-1.15 1.2Z" fill="#fff"/></svg>`;
      g.insertAdjacentHTML("beforeend", `<div class="ig-grid-item ${p.tipe}"><img src="${p.url}" alt="">${ic}<div class="save-guard"></div></div>`);
    });
  }

  // Prevent context menu or drag on embed wrapper to mimic standard IG behavior
  const wrapper = document.querySelector(".ig-lightweight-wrapper");
  if (wrapper) {
    wrapper.addEventListener("contextmenu", e => e.preventDefault());
    wrapper.addEventListener("dragstart", e => e.preventDefault());
  }

});