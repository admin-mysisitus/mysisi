/* ========== PORTOFOLIO PAGE - PORTFOLIO GRID & FILTERING ========== */
/* Halaman portofolio SISITUS dengan grid, filter kategori, dan load more functionality */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ========== PORTFOLIO DATA ==========
  const portfolioData = [
    {
      "id": 1,
      "name": "Jakalelana Tour & Travel",
      "type": "Website Perusahaan | Travel",
      "category": "perusahaan",
      "completed": "November 2025",
      "features": "Paket Wisata, Sewa Kendaraan, Layanan Driver",
      "url": "https://jakalelana.id",
      "image": "/assets/img/portfolio/web-1.jpg",
      "imageAlt": "Jakalelana Tour & Travel Website"
    },
    {
      "id": 2,
      "name": "Nasi Goreng Rasa Merakyat",
      "type": "Toko Online | Makanan",
      "category": "toko",
      "completed": "Oktober 2025",
      "features": "Form Pesanan, Pilihan Pembayaran, Tracking",
      "url": "https://mynasgor.pages.dev",
      "image": "/assets/img/portfolio/web-2.jpg",
      "imageAlt": "Nasi Goreng Rasa Merakyat Website"
    },
    {
      "id": 3,
      "name": "SMK Negeri 1 Sidoarjo",
      "type": "Web Instansi | Sekolah",
      "category": "sekolah",
      "completed": "September 2025",
      "features": "Kurikulum Merdeka, Ektrakurikuler, Bengkel Industri",
      "url": "https://smkn1sidoarjo.sch.id",
      "image": "/assets/img/portfolio/web-3.jpg",
      "imageAlt": "SMK Negeri 1 Sidoarjo Website"
    },
    {
      "id": 4,
      "name": "PPAI Darul Huda",
      "type": "Web Instansi | Pesantren",
      "category": "sekolah",
      "completed": "November 2025",
      "features": "Pendaftaran Santri, Donasi, Layanan Terpadu",
      "url": "https://myppai.pages.dev",
      "image": "/assets/img/portfolio/web-4.jpg",
      "imageAlt": "PPAI Darul Huda Website"
    },
    {
      "id": 5,
      "name": "Handoko Tantra",
      "type": "Personal Brand | Internet Marketing",
      "category": "personal",
      "completed": "Oktober 2025",
      "features": "Produk Digital, Konsultasi, Artikel Edukasi",
      "url": "https://produk.handokotantra.com",
      "image": "/assets/img/portfolio/web-5.jpg",
      "imageAlt": "Handoko Tantra Website"
    },
    {
      "id": 6,
      "name": "Fajar Kristiono",
      "type": "Personal Brand | Fotografi",
      "category": "personal",
      "completed": "September 2025",
      "features": "Galeri Foto, Buku Digital, Kalkulator Harga",
      "url": "https://fajarkristiono.com",
      "image": "/assets/img/portfolio/web-6.jpg",
      "imageAlt": "Fajar Kristiono Website"
    },
    {
      "id": 7,
      "name": "MTs Al-Ittihad Malang",
      "type": "Web Instansi | Sekolah",
      "category": "sekolah",
      "completed": "Desember 2025",
      "features": "Profil Sekolah, Pendaftaran, Informasi Akademik",
      "url": "https://mtsalittihadmlg.sch.id",
      "image": "/assets/img/portfolio/web-7.jpg",
      "imageAlt": "MTs Al-Ittihad Malang Website"
    },
    {
      "id": 8,
      "name": "Pemerintah Kota Surabaya",
      "type": "Website Perusahaan | Pemerintahan",
      "category": "perusahaan",
      "completed": "Januari 2026",
      "features": "Layanan Publik, Pengumuman, Informasi Kota",
      "url": "https://www.surabaya.go.id",
      "image": "/assets/img/portfolio/web-8.jpg",
      "imageAlt": "Pemerintah Kota Surabaya Website"
    },
    {
      "id": 9,
      "name": "Pemerintah Kota Malang",
      "type": "Website Perusahaan | Pemerintahan",
      "category": "perusahaan",
      "completed": "Januari 2026",
      "features": "Profil Kota, Layanan Administrasi, Agenda Kegiatan",
      "url": "https://www.malangkota.go.id",
      "image": "/assets/img/portfolio/web-9.jpg",
      "imageAlt": "Pemerintah Kota Malang Website"
    },
    {
      "id": 10,
      "name": "Bajulmati Official Store",
      "type": "Toko Online | Kerajinan Tangan",
      "category": "toko",
      "completed": "Februari 2026",
      "features": "Katalog Produk, Pembayaran Online, Garansi",
      "url": "https://www.bajulmati.com",
      "image": "/assets/img/portfolio/web-10.jpg",
      "imageAlt": "Bajulmati Official Store Website"
    },
    {
      "id": 11,
      "name": "Pemerintah Kabupaten Gunungkidul",
      "type": "Website Perusahaan | Pemerintahan",
      "category": "perusahaan",
      "completed": "Februari 2026",
      "features": "Pariwisata, Layanan Masyarakat, Data Statistik",
      "url": "https://www.gunungkidul.go.id",
      "image": "/assets/img/portfolio/web-11.jpg",
      "imageAlt": "Pemerintah Kabupaten Gunungkidul Website"
    },
    {
      "id": 12,
      "name": "Raden Ayu Bowo",
      "type": "Personal Brand | Seni dan Budaya",
      "category": "personal",
      "completed": "Maret 2026",
      "features": "Galeri Karya, Jadwal Pameran, Pesanan Kustom",
      "url": "https://www.radenayubowo.com",
      "image": "/assets/img/portfolio/web-12.jpg",
      "imageAlt": "Raden Ayu Bowo Website"
    }
  ];

  // ========== KONFIGURASI TAMPILAN ==========
  const INITIAL_ITEMS = 6; // Jumlah item yang ditampilkan awalnya
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

    card.innerHTML = `
      <div class="portfolio-card-image" onclick="window.open('${item.url}', '_blank')" style="cursor: pointer;">
        <img src="${item.image}" alt="${item.imageAlt}" loading="lazy">
        <div class="portfolio-overlay">
          <a href="${item.url}" target="_blank" class="btn btn-view">Lihat Website</a>
        </div>
      </div>
      <div class="portfolio-card-info">
        <h3>${item.name}</h3>
        <span class="portfolio-type">${item.type}</span>
        <div class="portfolio-detail"><span>Selesai:</span> ${item.completed}</div>
        <div class="portfolio-detail"><span>Fitur:</span> ${item.features}</div>
      </div>
    `;

    return card;
  }

  // ========== FUNGSI RENDER ITEMS ==========
  function renderItems(filter = 'all', limit = null) {
    // Kosongkan grid terlebih dahulu
    portfolioGrid.innerHTML = '';
    
    // Filter item berdasarkan kategori
    const filteredItems = portfolioData.filter(item => {
      return filter === 'all' || item.category === filter;
    });

    // Tentukan jumlah item yang akan ditampilkan
    const itemsToShow = limit ? Math.min(limit, filteredItems.length) : filteredItems.length;
    
    // Tambahkan card ke grid
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

    // Scroll to grid dengan smooth
    if (portfolioGrid) {
      portfolioGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ========== FUNGSI FILTER ITEMS ==========
  function filterItems(filterValue) {
    // Reset jumlah item yang ditampilkan
    displayedItems = INITIAL_ITEMS;
    renderItems(filterValue, INITIAL_ITEMS);
    
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
});