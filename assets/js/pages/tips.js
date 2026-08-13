/* ========== TIPS PAGE INTERACTIONS ========== */
/* Khusus untuk halaman tips dengan filter, bookmark, dan highlight functionality */
document.addEventListener('DOMContentLoaded', function() {
  const tipsCards = document.querySelectorAll('.tips-card, .artikel-card');
  // Pagination Elements
  const paginationLinks = document.querySelectorAll('.pagination .pagination-link');
  const prevBtn = paginationLinks.length > 0 ? paginationLinks[0] : null;
  const nextBtn = paginationLinks.length > 1 ? paginationLinks[paginationLinks.length - 1] : null;
  const pageInfo = document.querySelector('.pagination-info');
  let currentPage = 1;
  const cardsPerPage = 3;
  let currentCategory = 'Semua';

  function updateDisplay(scrollToTop = false) {
    if (tipsCards.length === 0) return;
    // 1. Filter
    const matchingCards = Array.from(tipsCards).filter(card => {
      if (currentCategory === 'Semua') return true;
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTags = Array.from(card.querySelectorAll('.tag, .artikel-meta span, .tips-meta span')).map(t => t.textContent.trim().toLowerCase());
      return cardTags.some(t => t.includes(currentCategory.toLowerCase())) || cardCategory.toLowerCase().includes(currentCategory.toLowerCase());
    });
    // 2. Paginate
    const totalPages = Math.max(1, Math.ceil(matchingCards.length / cardsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    // 3. Hide all
    tipsCards.forEach(card => {
      card.style.display = 'none';
      card.classList.add('hidden');
      card.classList.remove('visible');
    });
    // 4. Show current page
    const startIndex = (currentPage - 1) * cardsPerPage;
    const pageCards = matchingCards.slice(startIndex, startIndex + cardsPerPage);
    pageCards.forEach(card => {
      card.style.display = '';
      card.classList.remove('hidden');
      card.classList.add('visible');
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = 'slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    });
    if (pageInfo) {
      pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
    }
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
    const grid = document.querySelector('.artikel-grid, .tips-grid');
    if (grid) {
      grid.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
    if (scrollToTop) {
      const section = document.querySelector('.artikel-list-section') || document.querySelector('.artikel-grid');
      if (section) {
        const offset = 100;
        const offsetPosition = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
  // ========== EVENT LISTENERS ==========
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        currentCategory = this.getAttribute('data-category') || this.textContent.trim();
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentPage = 1;
        updateDisplay(false);
      });
    });
  }
  const tags = document.querySelectorAll('.tag');
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
      const matchingCount = Array.from(tipsCards).filter(card => {
        if (currentCategory === 'Semua') return true;
        const cardCategory = card.getAttribute('data-category') || '';
        const cardTags = Array.from(card.querySelectorAll('.tag, .artikel-meta span, .tips-meta span')).map(t => t.textContent.trim().toLowerCase());
        return cardTags.some(t => t.includes(currentCategory.toLowerCase())) || cardCategory.toLowerCase().includes(currentCategory.toLowerCase());
      }).length;
      const totalPages = Math.max(1, Math.ceil(matchingCount / cardsPerPage));
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay(true);
      }
    });
  }
  // Initialize display
  if (document.querySelector('.pagination')) {
    updateDisplay(false);
  }
  // ========== READING TIME CALCULATION ==========
  if (tipsCards.length > 0) {
    tipsCards.forEach(card => {
      const timeElement = card.querySelector('.reading-time');
      if (timeElement && timeElement.textContent.trim() === '') {
        const text = card.textContent;
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
        timeElement.textContent = `${readingTime} min read`;
      }
    });
  }
  // ========== BOOKMARK FUNCTIONALITY ==========
  const bookmarkButtons = document.querySelectorAll('[data-bookmark], .btn-bookmark');
  if (bookmarkButtons.length > 0) {
    bookmarkButtons.forEach(button => {
      // Check localStorage untuk restore state
      const tipId = button.getAttribute('data-tip-id') || button.closest('.tips-card, .artikel-card')?.id;
      if (tipId && localStorage.getItem(`bookmark-${tipId}`)) {
        button.classList.add('bookmarked');
        button.innerHTML = '<i class="fas fa-bookmark"></i> Disimpan';
      }
      button.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.toggle('bookmarked');
        if (this.classList.contains('bookmarked')) {
          localStorage.setItem(`bookmark-${tipId}`, 'true');
          this.innerHTML = '<i class="fas fa-bookmark"></i> Disimpan';
        } else {
          localStorage.removeItem(`bookmark-${tipId}`);
          this.innerHTML = '<i class="far fa-bookmark"></i> Bookmark';
        }
      });
    });
  }
  // ========== HIGHLIGHTS EXPAND/COLLAPSE ==========
  // Button logic dihilangkan, sekarang menggunakan slider scrollbar otomatis via CSS
  // ========== COPY CODE BLOCK ==========
  const codeBlocks = document.querySelectorAll('pre code, .code-block');
  if (codeBlocks.length > 0) {
    codeBlocks.forEach((block, index) => {
      // Only add wrapper if not already wrapped
      if (!block.parentElement.classList.contains('code-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        block.parentNode.insertBefore(wrapper, block);
        wrapper.appendChild(block);
      }
      const wrapper = block.closest('.code-wrapper');
      // Only add copy button if not already exists
      if (!wrapper.querySelector('.btn-copy-code')) {
        const copyButton = document.createElement('button');
        copyButton.className = 'btn-copy-code';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyButton.setAttribute('type', 'button');
        wrapper.appendChild(copyButton);
        copyButton.addEventListener('click', function() {
          const code = block.textContent;
          navigator.clipboard.writeText(code).then(() => {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
              this.innerHTML = originalText;
            }, 2000);
          }).catch(() => {
            // Failed to copy code
          });
        });
      }
    });
  }
  // ========== SHARE BUTTON LOGIC ==========
  const shareButtons = document.querySelectorAll('[data-share], .btn-share');
  if (shareButtons.length > 0) {
    shareButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = (this.getAttribute('data-share') || this.textContent).toLowerCase().trim();
        const title = document.querySelector('h1')?.textContent || 'Tips SISITUS';
        const url = window.location.href;
        let shareUrl = '';
        switch (platform) {
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        }
        if (shareUrl) {
          window.open(shareUrl, 'Share', 'width=600,height=400');
        }
      });
    });
  }
  // ========== AUTO SNAP SLIDER UNTUK MOBILE ==========
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
  initAutoSnapSlider(document.querySelector('.tips-grid'));
  initAutoSnapSlider(document.querySelector('.artikel-grid'));
});