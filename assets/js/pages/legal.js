/* ========== LEGAL PAGE INTERACTIONS ========== */
/* Halaman legal dengan accordion, navigation, dan functionality interaktif */

(function () {
  'use strict';

  // ========== SAFE DOM READY CHECK ==========
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    // ========== LEGAL NAVIGATION SMOOTH SCROLL & ACTIVE STATE ==========
    const navLinks = document.querySelectorAll('.legal-nav .nav-link');
    const articles = document.querySelectorAll('.legal-article');

    // Smooth scroll on nav link click
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Update active state
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');

          // Smooth scroll
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Highlight effect
          targetElement.style.backgroundColor = '#F0F9F7';
          setTimeout(() => {
            targetElement.style.backgroundColor = 'transparent';
          }, 2000);
        }
      });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', debounce(function () {
      let current = '';
      articles.forEach(article => {
        const rect = article.getBoundingClientRect();
        if (rect.top <= 150) {
          current = article.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, 100));

    // ========== ACCORDION FUNCTIONALITY (H3 SECTIONS) ==========
    const sectionHeaders = document.querySelectorAll('.legal-article h3');

    sectionHeaders.forEach((header, index) => {
      header.setAttribute('data-expanded', 'false');
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');

      // Get all content until next h3 or end of article
      const contents = getContentUntilNextH3(header);

      header.addEventListener('click', toggleAccordion);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion.call(this);
        }
      });

      function toggleAccordion() {
        const isExpanded = header.getAttribute('data-expanded') === 'true';
        const article = header.closest('.legal-article');

        // Close other sections in same article
        article.querySelectorAll('h3[data-expanded="true"]').forEach(h => {
          if (h !== header) {
            h.setAttribute('data-expanded', 'false');
            h.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current section
        if (isExpanded) {
          header.setAttribute('data-expanded', 'false');
          header.setAttribute('aria-expanded', 'false');
        } else {
          header.setAttribute('data-expanded', 'true');
          header.setAttribute('aria-expanded', 'true');
        }
      }
    });

    function getContentUntilNextH3(h3Element) {
      const contents = [];
      let sibling = h3Element.nextElementSibling;

      while (sibling && sibling.tagName !== 'H3') {
        contents.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      return contents;
    }

    // ========== DOCUMENT SEARCH FUNCTIONALITY ==========
    const searchInput = document.querySelector('input[type="search"], [data-legal-search]');

    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
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
          resultInfo.textContent = matchCount > 0
            ? `${matchCount} bagian ditemukan`
            : 'Tidak ada hasil';
          resultInfo.style.display = 'block';
        }
      }, 300));
    }

    function highlightMatches(element, query) {
      const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const nodesToReplace = [];
      let node;

      while (node = walker.nextNode()) {
        if (regex.test(node.textContent)) {
          nodesToReplace.push(node);
        }
      }

      nodesToReplace.forEach(node => {
        const span = document.createElement('span');
        span.innerHTML = node.textContent.replace(
          regex,
          '<mark style="background-color: #FEF3C7; padding: 0.2em 0.4em; border-radius: 3px;">$1</mark>'
        );
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
      link.addEventListener('click', function (e) {
        // Log interaction
      });
    });

    // ========== PRINT FUNCTIONALITY ==========
    const printButton = document.querySelector('[data-print], .btn-print');
    if (printButton) {
      printButton.addEventListener('click', function () {
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
      elem.addEventListener('focus', function () {
        this.style.outline = '2px solid var(--hijau-muda)';
        this.style.outlineOffset = '2px';
      });

      elem.addEventListener('blur', function () {
        this.style.outline = 'none';
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
document.addEventListener('DOMContentLoaded', function () {
  // Legacy: Table of contents support
  const tocLinks = document.querySelectorAll('.toc a, [data-toc-link]');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href')?.substring(1) || this.getAttribute('data-target');
      const targetElement = document.getElementById(targetId) || document.querySelector(`[data-section="${targetId}"]`);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
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
    printButton.addEventListener('click', function () {
      window.print();
    });
  }

  // ========== AGREE CHECKBOX ==========
  const agreeCheckbox = document.querySelector('input[type="checkbox"][data-agree], [data-terms-agree]');
  
  if (agreeCheckbox) {
    agreeCheckbox.addEventListener('change', function () {
      const submitButton = document.querySelector('button[data-submit-terms], .btn[data-submit]');
      
      if (submitButton) {
        submitButton.disabled = !this.checked;
        submitButton.style.opacity = this.checked ? '1' : '0.5';
        submitButton.style.cursor = this.checked ? 'pointer' : 'not-allowed';
      }
    });
  }

});
