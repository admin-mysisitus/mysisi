/* Blog Page Script - Auto Snap Slider untuk Mobile & Filter */
const blogData = [{
  title: "Web Hosting, SSL, dan Domain: Essentials untuk Semua Webmaster",
  date: "2025-01-22",
  category: "Tips & Trik",
  summary: "Tips praktis memilih domain, hosting, dan SSL certificate untuk website yang profesional, aman, dan optimal.",
  link: "/blog/tips-website/web-hosting-ssl-domain-essentials.html",
  img: "/assets/img/blog/seo-optimization.webp"
}, {
  title: "Panduan Lengkap Domain, Hosting, dan SSL untuk Website",
  date: "2025-01-20",
  category: "Artikel",
  summary: "Pahami tiga fondasi penting website dan bagaimana cara memilih yang tepat untuk mendapatkan website yang aman dan profesional.",
  link: "/blog/artikel/domain-hosting-dan-ssl.html",
  img: "/assets/img/blog/seo-optimization.webp"
}, {
  title: "Panduan Lengkap SEO untuk Website 2025",
  date: "2025-01-15",
  category: "Artikel",
  summary: "Pelajari strategi SEO terbaru yang terbukti meningkatkan ranking website Anda di Google. Dari keyword research hingga link building.",
  link: "/blog/artikel/panduan-lengkap-seo-2025.html",
  img: "/assets/img/blog/seo-optimization.webp"
}, {
  title: "Trend Desain Website 2025 yang Sedang Viral",
  date: "2025-01-10",
  category: "Tips & Trik",
  summary: "Jangan ketinggalan! Simak desain website modern yang sedang trending dan populer di kalangan designer profesional.",
  link: "/blog/tips-website/trend-desain-website-2025.html",
  img: "/assets/img/blog/web-design-trends.webp"
}, {
  title: "Memilih Platform Terbaik untuk Membangun Website",
  date: "2024-12-28",
  category: "Artikel",
  summary: "Bandingkan berbagai platform website mulai dari WordPress, Shopify, custom development, dan cara memilih yang terbaik untuk bisnis Anda.",
  link: "/blog/artikel/memilih-platform-terbaik-website.html",
  img: "/assets/img/banner-blog.webp"
}, {
  title: "Keamanan Website: Proteksi Bisnis Anda dari Serangan",
  date: "2024-12-20",
  category: "Artikel",
  summary: "Pelajari cara mengamankan website dari hacker, malware, dan serangan cyber lainnya dengan langkah-langkah praktis.",
  link: "/blog/artikel/keamanan-website.html",
  img: "/assets/img/blog/seo-optimization.webp"
}, {
  title: "Strategi Content Marketing untuk Bisnis Online",
  date: "2024-12-15",
  category: "Tips & Trik",
  summary: "Content adalah raja! Ketahui cara membuat konten yang berkualitas dan menarik untuk meningkatkan engagement pelanggan.",
  link: "/blog/tips-website/strategi-content-marketing.html",
  img: "/assets/img/banner-blog.webp"
}, {
  title: "Mobile-First Design: Mengapa Penting untuk Website Anda",
  date: "2024-12-10",
  category: "Tips & Trik",
  summary: "Mayoritas pengunjung website berasal dari mobile. Pelajari pentingnya mobile-first design dan cara implementasinya.",
  link: "/blog/tips-website/mobile-first-design.html",
  img: "/assets/img/blog/web-design-trends.webp"
}, {
  title: "Analitik Website: Memahami Perilaku Pengunjung",
  date: "2024-12-05",
  category: "Artikel",
  summary: "Gunakan analytics untuk memahami perilaku pengunjung dan tingkatkan conversion rate website Anda dengan data yang akurat.",
  link: "/blog/artikel/analitik-website.html",
  img: "/assets/img/banner-blog.webp"
}, {
  title: "Branding Digital: Bangun Identitas Kuat Online",
  date: "2024-11-30",
  category: "Artikel",
  summary: "Brand yang kuat adalah aset berharga. Pelajari cara membangun identitas digital yang konsisten dan memorable.",
  link: "/blog/artikel/branding-digital.html",
  img: "/assets/img/blog/web-design-trends.webp"
}];
document.addEventListener('DOMContentLoaded', () => {
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