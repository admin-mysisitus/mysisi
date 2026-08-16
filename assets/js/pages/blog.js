/* Blog Page Script - Auto Snap Slider untuk Mobile & Filter */
document.addEventListener('DOMContentLoaded', async () => {
  let blogData = [];
  try {
    const response = await fetch('/assets/data/blog.json');
    blogData = await response.json();
  } catch (error) {
    console.error('Failed to load blog data:', error);
  }
  // Sort array by date descending
  const sortedData = blogData.sort((a, b) => new Date(b.date) - new Date(a.date));
  // Format Date function
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  // Create Card HTML
  const createCardHTML = (post) => {
    return `
      <article class="featured-post">
        <div class="featured-image">
          <img src="${post.img}" alt="${post.title}" loading="lazy">
          <span class="post-category">${post.category}</span>
        </div>
        <div class="featured-content">
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <h3>${post.title}</h3>
          <p>${post.summary}</p>
          <a href="${post.link}" class="link-arrow">Baca Selengkapnya</a>
        </div>
      </article>
    `;
  };
  // Render grids
  const artikelGrid = document.getElementById('artikel-grid');
  const tipsGrid = document.getElementById('tips-grid');
  if (artikelGrid) {
    const artikelPosts = sortedData.filter(post => post.category === 'Artikel').slice(0, 3);
    artikelGrid.innerHTML = artikelPosts.map(post => createCardHTML(post)).join('');
  }
  if (tipsGrid) {
    const tipsPosts = sortedData.filter(post => post.category === 'Tips & Trik').slice(0, 3);
    tipsGrid.innerHTML = tipsPosts.map(post => createCardHTML(post)).join('');
  }
  // Fungsi Inisialisasi Slider Horizontal dengan Auto-Snap (serupa halaman Perusahaan & Domain Hosting)
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 3000;
    const resumeDelay = 3500;
    let track = sliderElement;
    if (!track || track.children.length === 0) return;
    const scrollToNext = () => {
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;
      // Jangan jalankan animasi jika kontennya muat (desktop/tanpa horizontal scroll)
      if (clientWidth >= scrollWidth - 5) return;
      isAutoScrolling = true;
      if (scrollFlagTimeout) clearTimeout(scrollFlagTimeout);
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderElement.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        const cardWidth = track.children[0].offsetWidth;
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
  // Inisialisasi slider horizontal untuk mobile pada grid blog
  if (artikelGrid) initAutoSnapSlider(artikelGrid);
  if (tipsGrid) initAutoSnapSlider(tipsGrid);
});