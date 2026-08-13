/* ========== ARTIKEL PAGE INTERACTIONS & PAGINATION (3 CARDS PER PAGE) ========== */
document.addEventListener('DOMContentLoaded', function() {
  const allCards = Array.from(document.querySelectorAll('.artikel-grid .artikel-card, .tips-grid .tips-card'));
  const categoryButtons = document.querySelectorAll('.category-btn');
  const tags = document.querySelectorAll('.tag');
  // Pagination Elements
  const paginationLinks = document.querySelectorAll('.pagination .pagination-link');
  const prevBtn = paginationLinks.length > 0 ? paginationLinks[0] : null;
  const nextBtn = paginationLinks.length > 1 ? paginationLinks[paginationLinks.length - 1] : null;
  const pageInfo = document.querySelector('.pagination-info');
  let currentPage = 1;
  const cardsPerPage = 3; // 1 baris 3 card per halaman
  let currentCategory = 'Semua';
  // Fungsi Utama: Filter Kategori & Paginate 3 Card
  function updateDisplay(scrollToTop = false) {
    if (allCards.length === 0) return;
    // 1. Filter card berdasarkan kategori aktif
    const matchingCards = allCards.filter(card => {
      if (currentCategory === 'Semua') return true;
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTags = Array.from(card.querySelectorAll('.tag, .artikel-meta span')).map(t => t.textContent.trim().toLowerCase());
      return cardTags.some(t => t.includes(currentCategory.toLowerCase())) || cardCategory.toLowerCase().includes(currentCategory.toLowerCase());
    });
    // 2. Hitung total halaman
    const totalPages = Math.max(1, Math.ceil(matchingCards.length / cardsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    // 3. Sembunyikan semua card terlebih dahulu
    allCards.forEach(card => {
      card.style.display = 'none';
      card.classList.add('hidden');
      card.classList.remove('visible');
    });
    // 4. Tampilkan 3 card untuk halaman saat ini (slice)
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageCards = matchingCards.slice(startIndex, endIndex);
    pageCards.forEach(card => {
      card.style.display = ''; // Gunakan default stylesheet (flex/grid)
      card.classList.remove('hidden');
      card.classList.add('visible');
      // Re-trigger animasi slideInUp yang halus
      card.style.animation = 'none';
      void card.offsetWidth; // Trigger reflow
      card.style.animation = 'slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    });
    // 5. Update teks informasi pagination (Halaman X dari Y)
    if (pageInfo) {
      pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
    }
    // 6. Update status tombol Sebelumnya
    if (prevBtn) {
      if (currentPage === 1) {
        prevBtn.classList.add('disabled');
        prevBtn.style.pointerEvents = 'none';
        prevBtn.style.opacity = '0.5';
      } else {
        prevBtn.classList.remove('disabled');
        prevBtn.style.pointerEvents = 'auto';
        prevBtn.style.opacity = '1';
      }
    }
    // 7. Update status tombol Berikutnya
    if (nextBtn) {
      if (currentPage === totalPages || totalPages === 0) {
        nextBtn.classList.add('disabled');
        nextBtn.style.pointerEvents = 'none';
        nextBtn.style.opacity = '0.5';
      } else {
        nextBtn.classList.remove('disabled');
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.opacity = '1';
      }
    }
    // 8. Reset posisi scroll horizontal pada grid mobile ke awal (kiri)
    const grid = document.querySelector('.artikel-grid, .tips-grid');
    if (grid) {
      grid.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
    // 9. Scroll halus ke atas daftar artikel jika diminta (saat ganti halaman)
    if (scrollToTop) {
      const section = document.querySelector('.artikel-list-section') || document.querySelector('.artikel-grid');
      if (section) {
        const offset = 100; // Kompensasi header fixed
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
  // ========== CATEGORY BUTTON EVENT LISTENERS ==========
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const category = this.getAttribute('data-category') || this.textContent.trim();
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentCategory = category;
        currentPage = 1; // Reset ke halaman pertama setiap kali filter berubah
        updateDisplay(false);
      });
    });
  }
  // ========== TAG EVENT LISTENERS ==========
  if (tags.length > 0) {
    tags.forEach(tag => {
      tag.addEventListener('click', function(e) {
        e.preventDefault();
        const tagText = this.textContent.trim();
        let matchedBtn = false;
        categoryButtons.forEach(btn => {
          if (btn.textContent.trim().toLowerCase() === tagText.toLowerCase()) {
            btn.click();
            matchedBtn = true;
          }
        });
        if (!matchedBtn) {
          currentCategory = tagText;
          currentPage = 1;
          categoryButtons.forEach(btn => btn.classList.remove('active'));
          updateDisplay(true);
        }
      });
    });
  }
  // ========== PAGINATION BUTTON EVENT LISTENERS ==========
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        updateDisplay(true);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Hitung total halaman saat ini
      const matchingCount = allCards.filter(card => {
        if (currentCategory === 'Semua') return true;
        const cardCategory = card.getAttribute('data-category') || '';
        const cardTags = Array.from(card.querySelectorAll('.tag, .artikel-meta span')).map(t => t.textContent.trim().toLowerCase());
        return cardTags.some(t => t.includes(currentCategory.toLowerCase())) || cardCategory.toLowerCase().includes(currentCategory.toLowerCase());
      }).length;
      const totalPages = Math.max(1, Math.ceil(matchingCount / cardsPerPage));
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay(true);
      }
    });
  }
  // ========== AUTO SNAP SLIDER UNTUK MOBILE (HANYA PADA CARD YANG VISIBLE) ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 3500;
    const resumeDelay = 4000;
    let track = sliderElement;
    if (!track) return;
    const scrollToNext = () => {
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;
      if (clientWidth >= scrollWidth - 5) return;
      const visibleCards = Array.from(track.children).filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
      if (visibleCards.length === 0) return;
      isAutoScrolling = true;
      if (scrollFlagTimeout) clearTimeout(scrollFlagTimeout);
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderElement.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        const cardWidth = visibleCards[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 16;
        sliderElement.scrollBy({
          left: cardWidth + gap,
          behavior: 'smooth'
        });
      }
      scrollFlagTimeout = setTimeout(() => {
        isAutoScrolling = false;
      }, 800);
    };
    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollInterval = setInterval(scrollToNext, slideInterval);
    };
    const stopAutoScroll = () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
    const handleInteraction = (e) => {
      if (e && e.type === 'scroll' && isAutoScrolling) return;
      stopAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoScroll, resumeDelay);
    };
    sliderElement.addEventListener('scroll', handleInteraction, {
      passive: true
    });
    sliderElement.addEventListener('wheel', handleInteraction, {
      passive: true
    });
    sliderElement.addEventListener('touchstart', handleInteraction, {
      passive: true
    });
    sliderElement.addEventListener('mousedown', handleInteraction);
    startAutoScroll();
  }
  // Inisialisasi awal tampilan (Halaman 1, 3 Card pertama)
  updateDisplay(false);
  // Inisialisasi slider untuk mobile
  initAutoSnapSlider(document.querySelector('.artikel-grid'));
  initAutoSnapSlider(document.querySelector('.tips-grid'));
});