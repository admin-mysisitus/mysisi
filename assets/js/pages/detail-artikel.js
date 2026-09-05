document.addEventListener('DOMContentLoaded', () => {
  createShareButtons();
  calculateReadingTime();
  generateTableOfContents();
  setupSmoothScroll();
  animateRelatedArticles();
  setupReadingProgress();
});

function createShareButtons() {
  const container = document.querySelector('.share-buttons-container');
  if (!container) return;
  container.removeAttribute('style');
  container.innerHTML = '';
  const getMetaContent = (property, attribute = 'property') => {
    return document.querySelector(`meta[${attribute}="${property}"]`)?.getAttribute('content') || null;
  };
  const metadata = {
    url: getMetaContent('og:url') || window.location.href,
    title: getMetaContent('og:title') || document.querySelector('h1')?.textContent || document.title,
    description: getMetaContent('og:description') || getMetaContent('description', 'name') || '',
    image: getMetaContent('og:image') || '',
    author: getMetaContent('article:author') || 'SISITUS Digital Service',
    publishDate: getMetaContent('article:published_time') || '',
    siteName: getMetaContent('og:site_name') || 'sisitus.com'
  };
  const shareButtons = [{
    name: 'facebook',
    title: 'Share di Facebook',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(metadata.url)}`,
    icon: 'fa-brands fa-facebook-f'
  }, {
    name: 'whatsapp',
    title: 'Share di WhatsApp',
    url: `https://wa.me/?text=${encodeURIComponent(`${metadata.title}\n\n${metadata.description}\n\n${metadata.url}`)}`,
    icon: 'fa-brands fa-whatsapp'
  }, {
    name: 'twitter',
    title: 'Share di X',
    url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(metadata.url)}&text=${encodeURIComponent(metadata.title)}&via=${encodeURIComponent(metadata.siteName)}`,
    icon: 'fa-brands fa-x-twitter'
  }, {
    name: 'telegram',
    title: 'Share di Telegram',
    url: `https://t.me/share/url?url=${encodeURIComponent(metadata.url)}&text=${encodeURIComponent(`${metadata.title}\n${metadata.description}`)}`,
    icon: 'fa-brands fa-telegram'
  }, {
    name: 'linkedin',
    title: 'Share di LinkedIn',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(metadata.url)}`,
    icon: 'fa-brands fa-linkedin-in'
  }, {
    name: 'email',
    title: 'Share via Email',
    url: `mailto:?subject=${encodeURIComponent(metadata.title)}&body=${encodeURIComponent(`${metadata.title}\n\n${metadata.description}\n\nBaca artikel lengkap: ${metadata.url}\n\nPengarang: ${metadata.author}\nSitus: ${metadata.siteName}`)}`,
    icon: 'fa-solid fa-envelope'
  }, {
    name: 'pinterest',
    title: 'Share di Pinterest',
    url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(metadata.url)}&description=${encodeURIComponent(metadata.title)}&media=${encodeURIComponent(metadata.image)}`,
    icon: 'fa-brands fa-pinterest-p'
  }, {
    name: 'line',
    title: 'Share di LINE',
    url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(metadata.url)}`,
    icon: 'fa-brands fa-line'
  }, {
    name: 'messenger',
    title: 'Share di Messenger',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(metadata.url)}`,
    icon: 'fa-brands fa-facebook-messenger'
  }, {
    name: 'sms',
    title: 'Kirim via SMS',
    url: `sms:?body=${encodeURIComponent(`${metadata.title}\n${metadata.url}`)}`,
    icon: 'fa-solid fa-comment'
  }, {
    name: 'print',
    title: 'Cetak Halaman',
    url: null,
    icon: 'fa-solid fa-print'
  }, {
    name: 'copy',
    title: 'Copy Link',
    url: null,
    icon: 'fa-solid fa-link'
  }];
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'share-buttons';
  const primaryKeys = ['facebook', 'whatsapp', 'twitter', 'telegram'];
  const primaryButtons = shareButtons.filter(btn => primaryKeys.includes(btn.name));
  const secondaryButtons = shareButtons.filter(btn => !primaryKeys.includes(btn.name));
  const createBtnElement = (btn) => {
    const button = document.createElement('a');
    button.className = `share-btn share-btn-${btn.name}`;
    button.title = btn.title;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
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
        document.body.classList.add('print-active');
        window.print();
        setTimeout(() => {
          document.body.classList.remove('print-active');
        }, 500);
      });
    } else {
      button.href = btn.url;
    }
    return button;
  };
  primaryButtons.forEach((btn) => {
    buttonsDiv.appendChild(createBtnElement(btn));
  });
  const moreBtn = document.createElement('button');
  moreBtn.className = 'share-btn share-btn-more';
  moreBtn.title = 'Lainnya';
  moreBtn.innerHTML = '<i class="fa-solid fa-ellipsis"></i>';
  buttonsDiv.appendChild(moreBtn);
  container.appendChild(buttonsDiv);
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'share-modal-overlay';
  const modalContent = document.createElement('div');
  modalContent.className = 'share-modal-content';
  const modalHeader = document.createElement('div');
  modalHeader.className = 'share-modal-header';
  modalHeader.innerHTML = '<h3>Bagikan Artikel</h3><button class="share-modal-close" title="Tutup"><i class="fa-solid fa-times"></i></button>';
  const modalBody = document.createElement('div');
  modalBody.className = 'share-modal-body';
  const modalGrid = document.createElement('div');
  modalGrid.className = 'share-modal-grid';
  secondaryButtons.forEach((btn) => {
    modalGrid.appendChild(createBtnElement(btn));
  });
  modalBody.appendChild(modalGrid);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.classList.remove('active');
  moreBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
  modalHeader.querySelector('.share-modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

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

function generateTableOfContents() {
  const artikelBody = document.querySelector('.artikel-body');
  const container = document.querySelector('.artikel-content .container');
  if (!artikelBody || !container) return;
  const headings = artikelBody.querySelectorAll('h2, h3');
  if (headings.length < 3) return;
  const tocContainer = document.createElement('div');
  tocContainer.className = 'toc-container';
  tocContainer.innerHTML = '<h3 class="toc-title">Daftar Isi</h3>';
  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `heading-${index}`;
    const li = document.createElement('li');
    li.className = `toc-item toc-${heading.tagName === 'H2' ? 'h2' : 'h3'}`;
    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;
    a.classList.add('toc-link');
    li.appendChild(a);
    tocList.appendChild(li);
  });
  tocContainer.appendChild(tocList);

  function updateTOC() {
    if (window.innerWidth < 768) {
      tocContainer.style.cssText = '';
      const ph = document.getElementById('toc-placeholder');
      if (ph) ph.remove();
      const shareContainer = document.querySelector('.share-buttons-container');
      if (shareContainer && shareContainer.parentNode) {
        shareContainer.parentNode.insertBefore(tocContainer, shareContainer.nextSibling);
      } else {
        container.appendChild(tocContainer);
      }
      return;
    }
    if (!container.contains(tocContainer)) {
      container.insertBefore(tocContainer, container.firstChild);
    }
    let placeholder = document.getElementById('toc-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = 'toc-placeholder';
      placeholder.style.cssText = 'grid-column: 2; grid-row: 1 / -1; width: 280px; display: none;';
      container.insertBefore(placeholder, container.firstChild);
    }
    const headerHeight = 80;
    const rect = container.getBoundingClientRect();
    const artikelBody = document.querySelector('.artikel-body');
    const bottomRect = artikelBody ? artikelBody.getBoundingClientRect().bottom : 9999;
    if (rect.top <= headerHeight && bottomRect > headerHeight + 100) {
      placeholder.style.display = 'block';
      tocContainer.style.cssText = `position: fixed; top: ${headerHeight + 10}px; right: ${window.innerWidth - rect.right}px; width: 280px; max-height: calc(100vh - 110px); z-index: 90; box-shadow: 0 4px 20px rgba(0,0,0,0.1);`;
    } else {
      placeholder.style.display = 'none';
      tocContainer.style.cssText = 'position: static; grid-column: 2; grid-row: 1 / -1; align-self: start;';
    }
  }
  if (window.__tocScrollHandler) {
    window.removeEventListener('scroll', window.__tocScrollHandler);
    window.removeEventListener('resize', window.__tocScrollHandler);
  }
  window.__tocScrollHandler = updateTOC;
  window.addEventListener('scroll', window.__tocScrollHandler, {
    passive: true
  });
  window.addEventListener('resize', window.__tocScrollHandler, {
    passive: true
  });
  updateTOC();
}

function setupSmoothScroll() {
  function getScrollOffset() {
    const header = document.querySelector('header');
    if (!header) return 0;
    const headerHeight = header.getBoundingClientRect().height;
    return headerHeight + 20;
  }
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = getScrollOffset();
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        setTimeout(() => {
          target.focus({
            preventScroll: true
          });
        }, 500);
      }
    });
  });
  document.querySelectorAll('.related-article a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.currentTarget.style.transition = 'opacity 0.3s ease';
      e.currentTarget.style.opacity = '0.7';
    });
  });
}

function animateRelatedArticles() {
  const relatedArticles = document.querySelectorAll('.related-article');
  if (!relatedArticles.length) return;
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  relatedArticles.forEach(article => {
    observer.observe(article);
  });
}

function setupReadingProgress() {
  const artikelBody = document.querySelector('.artikel-body');
  if (!artikelBody) return;
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;
    const totalScroll = documentHeight - windowHeight;
    const progress = (scrollPosition / totalScroll) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  });
}