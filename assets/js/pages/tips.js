/* ========== TIPS PAGE INTERACTIONS ========== */
/* Khusus untuk halaman tips dengan filter, bookmark, dan highlight functionality */

document.addEventListener('DOMContentLoaded', function () {
  const tipsCards = document.querySelectorAll('.tips-card, .artikel-card');
  
  // ========== TIPS FILTER LOGIC ==========
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        
        const category = this.getAttribute('data-category') || this.textContent.trim();
        
        // Update active state
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Filter cards
        tipsCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category') || '';
          const tags = card.querySelectorAll('.tag, .tips-meta span');
          let hasCategory = false;

          tags.forEach(tag => {
            if (tag.textContent.toLowerCase().includes(category.toLowerCase())) {
              hasCategory = true;
            }
          });
          
          const shouldShow = category === 'Semua' || hasCategory || cardCategory.includes(category);
          
          if (shouldShow) {
            card.classList.remove('hidden');
            card.style.display = 'block';
            card.style.animation = 'slideInUp 0.4s ease-out';
          } else {
            card.classList.add('hidden');
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ========== TAG FILTER LOGIC ==========
  const tags = document.querySelectorAll('.tag');
  
  if (tags.length > 0) {
    tags.forEach(tag => {
      tag.addEventListener('click', function (e) {
        e.preventDefault();
        const tagText = this.textContent.trim();
        
        tipsCards.forEach(card => {
          const cardTags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.trim());
          if (cardTags.includes(tagText)) {
            card.classList.remove('hidden', 'filtered');
            card.classList.add('visible');
            card.style.display = 'block';
            card.style.opacity = '1';
          } else {
            card.classList.remove('visible');
            card.classList.add('filtered');
            card.style.display = 'block';
            card.style.opacity = '0.5';
          }
        });
      });
    });
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

      button.addEventListener('click', function (e) {
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

        copyButton.addEventListener('click', function () {
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
      button.addEventListener('click', function (e) {
        e.preventDefault();
        
        const platform = (this.getAttribute('data-share') || this.textContent).toLowerCase().trim();
        const title = document.querySelector('h1')?.textContent || 'Tips SISITUS';
        const url = window.location.href;
        
        let shareUrl = '';
        
        switch(platform) {
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
        sliderElement.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const cardWidth = track.children[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 16;
        sliderElement.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
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

    sliderElement.addEventListener('scroll', handleInteraction, { passive: true });
    sliderElement.addEventListener('wheel', handleInteraction, { passive: true });
    sliderElement.addEventListener('touchstart', handleInteraction, { passive: true });
    sliderElement.addEventListener('mousedown', handleInteraction);

    startAutoScroll();
  }

  initAutoSnapSlider(document.querySelector('.tips-grid'));
  initAutoSnapSlider(document.querySelector('.artikel-grid'));
});
