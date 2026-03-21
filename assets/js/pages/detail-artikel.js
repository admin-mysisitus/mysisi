/* ========== DETAIL ARTIKEL PAGE SCRIPT ========== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Create share buttons
  createShareButtons();

  // 2. Calculate reading time
  calculateReadingTime();

  // 3. Generate Table of Contents
  generateTableOfContents();

  // 4. Smooth scroll for anchor links & related articles
  setupSmoothScroll();

  // 5. Add hover animations to related articles
  animateRelatedArticles();

  // 6. Setup reading progress tracking
  setupReadingProgress();
});

/**
 * Create share buttons dengan SVG icons
 */
function createShareButtons() {
  const container = document.querySelector('.share-buttons-container');
  if (!container) return;

  // Get metadata from meta tags untuk share yang lebih lengkap
  const getMetaContent = (property, attribute = 'property') => {
    return document.querySelector(`meta[${attribute}="${property}"]`)?.getAttribute('content') || null;
  };

  // Collect article metadata
  const metadata = {
    url: getMetaContent('og:url') || window.location.href,
    title: getMetaContent('og:title') || document.querySelector('h1')?.textContent || document.title,
    description: getMetaContent('og:description') || getMetaContent('description', 'name') || '',
    image: getMetaContent('og:image') || '',
    author: getMetaContent('article:author') || 'SISITUS Digital Service',
    publishDate: getMetaContent('article:published_time') || '',
    siteName: getMetaContent('og:site_name') || 'sisitus.com'
  };

  // Share platforms configuration dengan metadata lengkap
  const shareButtons = [
    {
      name: 'facebook',
      title: 'Share di Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(metadata.url)}`,
      icon: 'fa-brands fa-facebook-f'
    },
    {
      name: 'whatsapp',
      title: 'Share di WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(`${metadata.title}\n\n${metadata.description}\n\n${metadata.url}`)}`,
      icon: 'fa-brands fa-whatsapp'
    },
    {
      name: 'twitter',
      title: 'Share di X',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(metadata.url)}&text=${encodeURIComponent(metadata.title)}&via=${encodeURIComponent(metadata.siteName)}`,
      icon: 'fa-brands fa-x-twitter'
    },
    {
      name: 'telegram',
      title: 'Share di Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(metadata.url)}&text=${encodeURIComponent(`${metadata.title}\n${metadata.description}`)}`,
      icon: 'fa-brands fa-telegram'
    },
    {
      name: 'linkedin',
      title: 'Share di LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(metadata.url)}`,
      icon: 'fa-brands fa-linkedin-in'
    },
    {
      name: 'email',
      title: 'Share via Email',
      url: `mailto:?subject=${encodeURIComponent(metadata.title)}&body=${encodeURIComponent(`${metadata.title}\n\n${metadata.description}\n\nBaca artikel lengkap: ${metadata.url}\n\nPengarang: ${metadata.author}\nSitus: ${metadata.siteName}`)}`,
      icon: 'fa-solid fa-envelope'
    },
    {
      name: 'pinterest',
      title: 'Share di Pinterest',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(metadata.url)}&description=${encodeURIComponent(metadata.title)}&media=${encodeURIComponent(metadata.image)}`,
      icon: 'fa-brands fa-pinterest-p'
    },
    {
      name: 'line',
      title: 'Share di LINE',
      url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(metadata.url)}`,
      icon: 'fa-brands fa-line'
    },
    {
      name: 'messenger',
      title: 'Share di Messenger',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(metadata.url)}`,
      icon: 'fa-brands fa-facebook-messenger'
    },
    {
      name: 'sms',
      title: 'Kirim via SMS',
      url: `sms:?body=${encodeURIComponent(`${metadata.title}\n${metadata.url}`)}`,
      icon: 'fa-solid fa-comment'
    },
    {
      name: 'print',
      title: 'Cetak Halaman',
      url: null,
      icon: 'fa-solid fa-print'
    },
    {
      name: 'copy',
      title: 'Copy Link',
      url: null,
      icon: 'fa-solid fa-link'
    }
  ];
  // Create buttons container
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'share-buttons';

  shareButtons.forEach((btn) => {
    const button = document.createElement('a');
    button.className = `share-btn share-btn-${btn.name}`;
    button.title = btn.title;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';

    // Add Font Awesome icon
    const icon = document.createElement('i');
    icon.className = btn.icon;
    button.appendChild(icon);

    if (btn.name === 'copy') {
      button.href = '#';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(metadata.url).then(() => {
          const originalText = button.title;
          button.title = 'Link copied!';
          setTimeout(() => {
            button.title = originalText;
          }, 2000);
        });
      });
    } else if (btn.name === 'print') {
      button.href = '#';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Add print-active class to body untuk CSS media query
        document.body.classList.add('print-active');
        window.print();
        // Remove class setelah print dialog ditutup
        setTimeout(() => {
          document.body.classList.remove('print-active');
        }, 500);
      });
    } else {
      button.href = btn.url;
    }

    buttonsDiv.appendChild(button);
  });

  container.appendChild(buttonsDiv);
}

/**
 * Calculate reading time based on word count
 */
function calculateReadingTime() {
  const artikelBody = document.querySelector('.artikel-body');
  if (artikelBody) {
    const text = artikelBody.innerText;
    const wordsCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordsCount / 200); // Assuming 200 words per minute
    
    const readingTimeElement = document.querySelector('.reading-time');
    if (readingTimeElement) {
      readingTimeElement.textContent = `${readingTime} menit baca`;
    }
  }
}

/**
 * Generate Table of Contents dari headings
 */
function generateTableOfContents() {
  const artikelBody = document.querySelector('.artikel-body');
  const container = document.querySelector('.artikel-content .container');
  if (!artikelBody || !container) return;

  const headings = artikelBody.querySelectorAll('h2, h3');
  if (headings.length < 3) return; // Hanya buat TOC jika ada 3+ headings

  // Create TOC container
  const tocContainer = document.createElement('div');
  tocContainer.className = 'toc-container';
  tocContainer.innerHTML = '<h3 class="toc-title">Daftar Isi</h3>';
  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';

  // Generate headings IDs and create TOC items
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const li = document.createElement('li');
    const level = heading.tagName === 'H2' ? 'h2' : 'h3';
    li.className = `toc-item toc-${level}`;

    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;
    a.classList.add('toc-link');

    li.appendChild(a);
    tocList.appendChild(li);
  });

  tocContainer.appendChild(tocList);
  
  // Append TOC ke container (sidebar position) - akan tampil di sebelah kanan di desktop
  container.appendChild(tocContainer);
}

/**
 * Setup smooth scroll untuk anchor links dan related articles
 */
function setupSmoothScroll() {
  // Function untuk menghitung offset dari header
  function getScrollOffset() {
    const header = document.querySelector('header');
    if (!header) return 0;
    
    const headerHeight = header.getBoundingClientRect().height;
    // Tambahkan sedikit padding tambahan untuk spacing yang lebih baik (20px)
    return headerHeight + 20;
  }

  // Anchor links dalam artikel
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        // Custom scroll dengan offset untuk fixed header
        const offset = getScrollOffset();
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Focus element setelah scroll selesai
        setTimeout(() => {
          target.focus({ preventScroll: true });
        }, 500);
      }
    });
  });

  // Related articles links
  document.querySelectorAll('.related-article a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.currentTarget.style.transition = 'opacity 0.3s ease';
      e.currentTarget.style.opacity = '0.7';
    });
  });
}

/**
 * Animate related articles on scroll into view
 */
function animateRelatedArticles() {
  const relatedArticles = document.querySelectorAll('.related-article');
  
  if (!relatedArticles.length) return;

  // Setup Intersection Observer untuk lazy animation
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add animation delay untuk staggered effect
        entry.target.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  relatedArticles.forEach(article => {
    observer.observe(article);
  });
}

/**
 * Setup reading progress tracking
 */
function setupReadingProgress() {
  const artikelBody = document.querySelector('.artikel-body');
  if (!artikelBody) return;

  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  document.body.appendChild(progressBar);

  // Update progress on scroll
  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;

    // Calculate progress percentage
    const totalScroll = documentHeight - windowHeight;
    const progress = (scrollPosition / totalScroll) * 100;

    progressBar.style.width = `${Math.min(progress, 100)}%`;
  });
}

