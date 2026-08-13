/* ========== LEGAL PAGE INTERACTIONS ========== */
/* Halaman legal dengan accordion, navigation, dan functionality interaktif */
(function() {
  'use strict';
  // ========== SAFE DOM READY CHECK ==========
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
  onReady(function() {
    // ========== SIDEBAR TABS LOGIC ==========
    const tabButtons = document.querySelectorAll('.legal-menu-btn');
    const articles = document.querySelectorAll('.legal-article');
    if (tabButtons.length > 0 && articles.length > 0) {
      tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const targetId = this.getAttribute('data-target');
          // Remove active class from all buttons and articles
          tabButtons.forEach(b => b.classList.remove('active'));
          articles.forEach(a => a.classList.remove('active'));
          // Add active class to clicked button and target article
          this.classList.add('active');
          const targetArticle = document.getElementById(targetId);
          if (targetArticle) {
            targetArticle.classList.add('active');
            // Scroll to top of content area
            const contentArea = document.querySelector('.legal-content-area');
            if (contentArea) {
              const headerOffset = 80;
              const elementPosition = contentArea.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        });
      });
      // Handle URL hash on load
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const targetBtn = document.querySelector(`.legal-menu-btn[data-target="${hash}"]`);
        if (targetBtn) {
          targetBtn.click();
        }
      }
    }
    // ========== DOCUMENT SEARCH FUNCTIONALITY ==========
    const searchInput = document.querySelector('input[type="search"], [data-legal-search]');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function() {
        const query = this.value.toLowerCase().trim();
        if (query === '') {
          // Reset all articles
          articles.forEach(article => {
            article.style.display = 'block';
            article.innerHTML = article.innerHTML.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
          });
          return;
        }
        let matchCount = 0;
        articles.forEach(article => {
          const text = article.textContent.toLowerCase();
          if (text.includes(query)) {
            article.style.display = 'block';
            highlightMatches(article, query);
            // Expand all h3 sections when search is active
            article.querySelectorAll('h3').forEach(h3 => {
              h3.setAttribute('data-expanded', 'true');
              h3.setAttribute('aria-expanded', 'true');
            });
            matchCount++;
          } else {
            article.style.display = 'none';
          }
        });
        // Show results count
        const resultInfo = document.querySelector('[data-search-results]');
        if (resultInfo) {
          resultInfo.textContent = matchCount > 0 ? `${matchCount} bagian ditemukan` : 'Tidak ada hasil';
          resultInfo.style.display = 'block';
        }
      }, 300));
    }

    function highlightMatches(element, query) {
      const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
      const nodesToReplace = [];
      let node;
      while (node = walker.nextNode()) {
        if (regex.test(node.textContent)) {
          nodesToReplace.push(node);
        }
      }
      nodesToReplace.forEach(node => {
        const span = document.createElement('span');
        span.innerHTML = node.textContent.replace(regex, '<mark style="background-color: #FEF3C7; padding: 0.2em 0.4em; border-radius: 3px;">$1</mark>');
        node.parentNode.replaceChild(span, node);
      });
      regex.lastIndex = 0;
    }

    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    // ========== CONTACT LINKS ENHANCEMENT ==========
    const contactLinks = document.querySelectorAll('.contact-info a');
    contactLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Log interaction
      });
    });
    // ========== PRINT FUNCTIONALITY ==========
    const printButton = document.querySelector('[data-print], .btn-print');
    if (printButton) {
      printButton.addEventListener('click', function() {
        window.print();
      });
    }
    // ========== LAST UPDATED DATE ==========
    const lastUpdatedElements = document.querySelectorAll('.last-updated');
    lastUpdatedElements.forEach(elem => {
      if (!elem.textContent.includes('Januari') && !elem.textContent.includes('updated')) {
        const today = new Date();
        const dateStr = today.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        elem.textContent = `Terakhir diperbarui: ${dateStr}`;
      }
    });
    // ========== ACCESSIBILITY: FOCUS MANAGEMENT ==========
    const interactiveElements = document.querySelectorAll('.legal-nav .nav-link, .legal-article h3');
    interactiveElements.forEach(elem => {
      elem.addEventListener('focus', function() {
        this.style.outline = '2px solid var(--hijau-muda)';
        this.style.outlineOffset = '2px';
      });
      elem.addEventListener('blur', function() {
        this.style.outline = 'none';
      });
    });
    // ========== FAQ AUTO SCROLL ==========
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        // Give time for the default toggle and any CSS transitions
        setTimeout(() => {
          if (item && item.hasAttribute('open')) {
            const headerOffset = 90; // Offset for sticky header
            const elementPosition = item.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 150);
      });
    });
  });
  // ========== UTILITY: DEBOUNCE FUNCTION ==========
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
})();
// ========== OLD CODE COMPATIBILITY ==========
// Keeping these for backward compatibility if HTML needs them
document.addEventListener('DOMContentLoaded', function() {
  // Legacy: Table of contents support
  const tocLinks = document.querySelectorAll('.toc a, [data-toc-link]');
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href')?.substring(1) || this.getAttribute('data-target');
      const targetElement = document.getElementById(targetId) || document.querySelector(`[data-section="${targetId}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Highlight the section
        targetElement.style.backgroundColor = '#FEF3C7';
        setTimeout(() => {
          targetElement.style.backgroundColor = 'transparent';
        }, 2000);
      }
    });
  });
  // ========== LAST UPDATED INFO ==========
  const lastUpdated = document.querySelector('[data-last-updated], .last-updated');
  if (lastUpdated && !lastUpdated.textContent.includes('Terakhir diperbarui')) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    lastUpdated.textContent = `Terakhir diperbarui: ${dateStr}`;
  }
  // ========== PRINT DOCUMENT ==========
  const printButton = document.querySelector('[data-print], .btn-print');
  if (printButton) {
    printButton.addEventListener('click', function() {
      window.print();
    });
  }
  // ========== AGREE CHECKBOX ==========
  const agreeCheckbox = document.querySelector('input[type="checkbox"][data-agree], [data-terms-agree]');
  if (agreeCheckbox) {
    agreeCheckbox.addEventListener('change', function() {
      const submitButton = document.querySelector('button[data-submit-terms], .btn[data-submit]');
      if (submitButton) {
        submitButton.disabled = !this.checked;
        submitButton.style.opacity = this.checked ? '1' : '0.5';
        submitButton.style.cursor = this.checked ? 'pointer' : 'not-allowed';
      }
    });
  }
});