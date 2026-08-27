/* ========== PORTOFOLIO PAGE - PORTFOLIO GRID & FILTERING ========== */
/* Halaman portofolio SISITUS dengan grid, filter kategori, dan load more functionality */
document.addEventListener('DOMContentLoaded', async function() {
  'use strict';
  // ========== PORTFOLIO DATA ==========
  let portfolioData = [];
  try {
    const response = await fetch('/assets/data/portfolio.json');
    portfolioData = await response.json();
  } catch (error) {
    void('Failed to load portfolio data:', error);
  }
  // ========== KONFIGURASI TAMPILAN ==========
  const INITIAL_ITEMS = 8; // Jumlah item yang ditampilkan awalnya
  let currentFilter = 'all';
  let displayedItems = INITIAL_ITEMS;
  const portfolioGrid = document.getElementById('portfolio-grid');
  const btnLoadMore = document.getElementById('btn-load-more');
  // ========== FUNGSI MEMBUAT PORTFOLIO CARD ==========
  function createPortfolioCard(item) {
    const card = document.createElement('article');
    card.className = 'portfolio-card';
    card.dataset.category = item.category;
    card.dataset.id = item.id;
    card.style.animation = 'fadeInUp 0.6s ease-out forwards';
    // Split features into array for pill tags
    const featureTags = item.features.split(',').map(f => `<span class="feature-tag">${f.trim()}</span>`).join('');
    card.innerHTML = `
      <div class="portfolio-card-image" onclick="window.open('${item.url}', '_blank')">
        <img src="${item.image}" alt="${item.imageAlt}" loading="lazy">
        <div class="portfolio-image-overlay">
          <a href="${item.url}" target="_blank" class="btn btn-view-hover" aria-label="Kunjungi Website ${item.name}">Kunjungi Website</a>
        </div>
      </div>
      <div class="portfolio-card-info">
        <h3>${item.name}</h3>
        <span class="portfolio-type">${item.type}</span>
        <div class="portfolio-meta">
          <span class="meta-icon"><i class="fas fa-calendar-check"></i></span>
          <span class="meta-text">${item.completed}</span>
        </div>
        <div class="portfolio-features">
          ${featureTags}
        </div>
      </div>
    `;
    return card;
  }
  // ========== FUNGSI RENDER ITEMS ==========
  function renderItems(filter = 'all', limit = null, shouldScroll = false) {
    // Kosongkan grid terlebih dahulu
    portfolioGrid.innerHTML = '';
    // Filter item berdasarkan kategori
    const filteredItems = portfolioData.filter(item => {
      return filter === 'all' || item.category === filter;
    });
    // Tentukan jumlah item yang akan ditampilkan
    const itemsToShow = limit ? Math.min(limit, filteredItems.length) : filteredItems.length;
    // Tambahkan card ke grid secara langsung (tanpa row)
    for (let i = 0; i < itemsToShow; i++) {
      portfolioGrid.appendChild(createPortfolioCard(filteredItems[i]));
    }
    // Sembunyikan tombol jika semua item sudah ditampilkan
    if (filteredItems.length <= itemsToShow) {
      if (btnLoadMore) btnLoadMore.classList.add('hidden');
    } else {
      if (btnLoadMore) btnLoadMore.classList.remove('hidden');
    }
    // Update status filter dan jumlah item yang ditampilkan
    currentFilter = filter;
    displayedItems = itemsToShow;
    // Scroll to grid dengan smooth jika dipicu oleh filter
    if (shouldScroll && portfolioGrid) {
      portfolioGrid.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  // ========== FUNGSI FILTER ITEMS ==========
  function filterItems(filterValue) {
    // Reset jumlah item yang ditampilkan
    displayedItems = INITIAL_ITEMS;
    renderItems(filterValue, INITIAL_ITEMS, true);
    // Update status tombol filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filterValue);
    });
  }
  // ========== FUNGSI LOAD MORE ITEMS ==========
  function loadMoreItems() {
    displayedItems += INITIAL_ITEMS;
    renderItems(currentFilter, displayedItems);
  }
  // ========== SETUP FILTER BUTTONS ==========
  function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterItems(btn.dataset.filter);
      });
    });
  }
  // ========== SETUP LOAD MORE BUTTON ==========
  function setupLoadMoreButton() {
    if (btnLoadMore) {
      btnLoadMore.addEventListener('click', loadMoreItems);
    }
  }
  // ========== PORTFOLIO CARD HOVER EFFECTS ==========
  function setupCardHoverEffects() {
    portfolioGrid.addEventListener('mouseover', function(e) {
      const card = e.target.closest('.portfolio-card');
      if (card) {
        card.style.transform = 'translateY(-8px)';
      }
    });
    portfolioGrid.addEventListener('mouseout', function(e) {
      const card = e.target.closest('.portfolio-card');
      if (card) {
        card.style.transform = 'translateY(0)';
      }
    });
  }
  // ========== INISIALISASI ==========
  setupFilterButtons();
  setupLoadMoreButton();
  // Tampilkan item awal dengan filter "all"
  renderItems('all', INITIAL_ITEMS);
  // Setup hover effects
  if (portfolioGrid) {
    setupCardHoverEffects();
  }
  // ========== ACCESSIBILITY ==========
  const filterContainer = document.getElementById('filter-container');
  if (filterContainer) {
    filterContainer.addEventListener('keypress', function(e) {
      if (e.target.classList.contains('filter-btn')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.target.click();
        }
      }
    });
  }
  // ========== ANALYTICS TRACKING ==========
  // Track portfolio item clicks
  portfolioGrid.addEventListener('click', function(e) {
    const viewBtn = e.target.closest('.btn-view');
    if (viewBtn && window.gtag) {
      const card = e.target.closest('.portfolio-card');
      const projectName = card?.querySelector('h3')?.textContent || 'Unknown';
      gtag('event', 'portfolio_click', {
        'project_name': projectName,
        'category': currentFilter
      });
    }
  });
  // Track filter usage
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (window.gtag) {
        gtag('event', 'portfolio_filter', {
          'filter_category': this.dataset.filter
        });
      }
    });
  });
  // ========== AUTO SCROLL SLIDERS ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    let autoScrollInterval;
    let resumeTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const scrollToNext = () => {
      if (!sliderElement.children || sliderElement.children.length === 0) return;
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;
      // Jangan scroll otomatis di Desktop (saat konten tidak overflow)
      if (clientWidth >= scrollWidth - 5) return;
      isAutoScrolling = true;
      if (scrollFlagTimeout) clearTimeout(scrollFlagTimeout);
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderElement.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        const itemWidth = sliderElement.children[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(sliderElement).gap) || 8;
        sliderElement.scrollBy({
          left: itemWidth + gap,
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
  const filterBtnsContainer = document.querySelector('.filter-buttons');
  initAutoSnapSlider(filterBtnsContainer);
});