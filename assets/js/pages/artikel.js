document.addEventListener('DOMContentLoaded', function() {
  const allCards = Array.from(document.querySelectorAll('.artikel-grid .artikel-card, .tips-grid .tips-card'));
  const categoryButtons = document.querySelectorAll('.category-btn');
  const tags = document.querySelectorAll('.tag');
  const paginationLinks = document.querySelectorAll('.pagination .pagination-link');
  const prevBtn = paginationLinks.length > 0 ? paginationLinks[0] : null;
  const nextBtn = paginationLinks.length > 1 ? paginationLinks[paginationLinks.length - 1] : null;
  const pageInfo = document.querySelector('.pagination-info');
  let currentPage = 1;
  const cardsPerPage = 6;
  let currentCategory = 'Semua';
  let currentSearch = '';
  const searchInput = document.getElementById('searchInput');

  function updateDisplay(scrollToTop = false) {
    if (allCards.length === 0) return;
    const matchingCards = allCards.filter(card => {
      let categoryMatch = true;
      if (currentCategory !== 'Semua') {
        const cardCategory = card.getAttribute('data-category') || '';
        const cardTags = Array.from(card.querySelectorAll('.tag, .artikel-meta span')).map(t => t.textContent.trim().toLowerCase());
        categoryMatch = cardTags.some(t => t.includes(currentCategory.toLowerCase())) || cardCategory.toLowerCase().includes(currentCategory.toLowerCase());
      }
      let searchMatch = true;
      if (currentSearch.trim() !== '') {
        const searchVal = currentSearch.toLowerCase().trim();
        const cardText = card.textContent.toLowerCase();
        searchMatch = cardText.includes(searchVal);
      }
      return categoryMatch && searchMatch;
    });
    const totalPages = Math.max(1, Math.ceil(matchingCards.length / cardsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    allCards.forEach(card => {
      card.style.display = 'none';
      card.classList.add('hidden');
      card.classList.remove('visible');
    });
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageCards = matchingCards.slice(startIndex, endIndex);
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
    if (scrollToTop) {
      const section = document.querySelector('.artikel-list-section') || document.querySelector('.artikel-grid');
      if (section) {
        const offset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const category = this.getAttribute('data-category') || this.textContent.trim();
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentCategory = category;
        currentPage = 1;
        updateDisplay(false);
      });
    });
  }
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
      const matchingCount = allCards.filter(card => {
        let categoryMatch = true;
        if (currentCategory !== 'Semua') {
          const cardCategory = card.getAttribute('data-category') || '';
          const cardTags = Array.from(card.querySelectorAll('.tag, .artikel-meta span')).map(t => t.textContent.trim().toLowerCase());
          categoryMatch = cardTags.some(t => t.includes(currentCategory.toLowerCase())) || cardCategory.toLowerCase().includes(currentCategory.toLowerCase());
        }
        let searchMatch = true;
        if (currentSearch.trim() !== '') {
          searchMatch = card.textContent.toLowerCase().includes(currentSearch.toLowerCase().trim());
        }
        return categoryMatch && searchMatch;
      }).length;
      const totalPages = Math.max(1, Math.ceil(matchingCount / cardsPerPage));
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay(true);
      }
    });
  }
  updateDisplay(false);
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      currentSearch = e.target.value;
      currentPage = 1;
      updateDisplay(false);
    });
  }
});