(async function() {
  'use strict';
  // Import cart managers
  const {
    CartManager,
    WishlistManager
  } = await import('../modules/unified-cart.js');
  const {
    AuthManager
  } = await import('../modules/unified-auth.js');
  const {
    showSuccess,
    showError,
    showInfo,
    formatCurrency
  } = await import('../modules/unified-utils.js');
  const APIClient = (await import('../modules/unified-api.js')).default;
  // Get the section container
  const section = document.querySelector('.cek-domain-section');
  if (!section) return;
  const {
    parseDomain,
    validateDomain
  } = await import('../modules/domain-utils.js');
  let allExtensions = [];
  try {
    const res = await fetch('/assets/data/domain_pricing.json');
    allExtensions = await res.json();
  } catch (err) {
    console.error('Failed to load domain pricing:', err);
  }
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
  // Definisikan Niat (Intent) & Bobot Prioritas Ekstensi
  const DOMAIN_INTENTS = [{
    name: 'Pendidikan',
    regex: /(sekolah|kampus|univ|akademi|belajar|kursus|edu|sdn|smpn|sman|smkn|ponpes|pesantren)/i,
    priorities: ['.sch.id', '.ac.id', '.id', '.com']
  }, {
    name: 'Organisasi',
    regex: /(komunitas|yayasan|forum|club|klub|peduli|asosiasi|org|panti)/i,
    priorities: ['.or.id', '.org', '.id', '.com']
  }, {
    name: 'Pemerintahan',
    regex: /(pemkab|pemkot|pemprov|dinas|desa|kabupaten)/i,
    priorities: ['.go.id', '.id']
  }, {
    name: 'IT / Tech',
    regex: /(tech|tekno|digital|cyber|net|host|cloud|app|soft|dev)/i,
    priorities: ['.it.com', '.cloud', '.net', '.com', '.id']
  }, {
    name: 'Bisnis / Perusahaan',
    regex: /(pt|cv|corp|company|industri|pabrik|group|holding)/i,
    priorities: ['.co.id', '.com', '.biz.id', '.id']
  }, {
    name: 'Toko Online / Retail',
    regex: /(toko|shop|mart|store|grosir|jual|beli|murah|official|boutique)/i,
    priorities: ['.com', '.id', '.co.id', '.biz.id']
  }, {
    name: 'Personal / Portofolio',
    regex: /(blog|my|aku|saya|profil|portfolio|catatan|jurnal|galeri|foto)/i,
    priorities: ['.my.id', '.web.id', '.xyz', '.id']
  }];

  function calculateSavings(oldP, newP) {
    if (!oldP) return 0;
    return Math.round((1 - newP / oldP) * 100);
  }

  function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  // ============================================
  // DOM ELEMENTS CACHE - Query once, use everywhere
  // ============================================
  const cekDomainInput = section.querySelector('#cek-domain-input');
  const cekDomainError = section.querySelector('#cek-domain-error');
  const cekDomainBtn = section.querySelector('#cek-domain-btn');
  const cekDomainSuggestions = section.querySelector('#cek-domain-suggestions');
  const cekDomainResultsList = section.querySelector('#cek-domain-results-list');
  const cekDomainResults = section.querySelector('#cek-domain-results');
  const cekDomainForm = section.querySelector('#cek-domain-form-main');
  const cekDomainPopularExtensions = section.querySelector('#cek-domain-popular-extensions');
  const cekDomainPricingPreview = section.querySelector('.cek-domain-pricing-preview');
  // Validate essential elements exist
  if (!cekDomainInput || !cekDomainForm) return;
  // Create intent badge dynamically
  const intentBadge = document.createElement('div');
  intentBadge.className = 'cek-domain-intent-badge';
  // Insert it before the form
  cekDomainForm.parentNode.insertBefore(intentBadge, cekDomainForm);
  // ============================================
  // PLACEHOLDER ANIMATION (Typing Effect)
  // ============================================
  function initiatePlaceholderAnimation() {
    const placeholderTexts = ['toko online anda...', 'contohwebsite.com', 'bisnisanda.id', 'blogdigital.my.id', 'organisasimu.org', 'sekolahku.sch.id'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentText = placeholderTexts[textIndex];
      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }
      cekDomainInput.setAttribute('placeholder', currentText.substring(0, charIndex));
      let speed = isDeleting ? 50 : 100;
      if (!isDeleting && charIndex === currentText.length) {
        speed = 1500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % placeholderTexts.length;
        speed = 300;
      }
      setTimeout(typeEffect, speed);
    }
    typeEffect();
  }
  // ============================================
  // PRICING PREVIEW
  // ============================================
  function selectDomainItem(value) {
    cekDomainInput.value = value;
    cekDomainBtn.click();
  }

  function renderPricingPreview() {
    if (!cekDomainPopularExtensions) return;
    cekDomainPopularExtensions.innerHTML = '';
    const sortedExts = [...allExtensions].sort((a, b) => {
      const order = {
        best: 3,
        cheap: 2,
        business: 1,
        none: 0
      };
      return order[b.highlight] - order[a.highlight];
    }).slice(0, 8);
    sortedExts.forEach((ext, idx) => {
      const discount = calculateSavings(ext.oldPrice, ext.newPrice);
      const item = document.createElement('div');
      item.className = `cek-domain-ext-item ${ext.highlight !== 'none' ? `highlight-${ext.highlight}` : ''}`;
      item.style.animationDelay = `${idx * 0.08}s`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      let labels = '';
      if (ext.label) {
        labels = `<span class="cek-domain-ext-label">${ext.label}</span>`;
      }
      if (discount > 0) {
        labels += `<span class="cek-domain-ext-discount">-${discount}%</span>`;
      }
      const extColor = ext.color || '#1a1a2e';
      item.innerHTML = `
        <div class="cek-domain-ext-labels">${labels}</div>
        <div class="cek-domain-ext-name" style="color: ${extColor}; font-weight: 800;">${ext.ext}</div>
        <div class="cek-domain-ext-prices">
          ${ext.oldPrice ? `<span class="cek-domain-ext-old">${formatCurrency(ext.oldPrice)}</span>` : ''}
          <span class="cek-domain-ext-new">${formatCurrency(ext.newPrice)}</span>
        </div>
        <div class="cek-domain-ext-info">${ext.info}</div>
      `;
      const handleSelect = () => {
        // Preserve what they typed, just replace/append extension
        const currentInput = cekDomainInput.value;
        const parsed = parseDomain(currentInput, allExtensions);
        const base = parsed.base || '';
        cekDomainInput.value = base + ext.ext;
        cekDomainInput.focus();
        // Place cursor at start if empty, or at end if they typed a brand
        const cursorPosition = base.length > 0 ? cekDomainInput.value.length : 0;
        setTimeout(() => {
          cekDomainInput.setSelectionRange(cursorPosition, cursorPosition);
          cekDomainInput.dispatchEvent(new Event('input')); // trigger suggestions
        }, 10);
      };
      item.addEventListener('click', handleSelect);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSelect();
      });
      cekDomainPopularExtensions.appendChild(item);
    });
    // Show pricing preview
    if (cekDomainPricingPreview) {
      cekDomainPricingPreview.style.display = 'block';
      cekDomainPricingPreview.classList.add('fade-in');
    }
  }
  // ============================================
  // DOMAIN CONFIGURATION & VALIDATION
  // (Validation and parsing logic moved to config.js)
  // ============================================
  async function fastCheckDNS(domain) {
    try {
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
        headers: {
          'accept': 'application/dns-json'
        },
      });
      if (!response.ok) return true;
      const data = await response.json();
      return !data.Answer || data.Answer.length === 0;
    } catch (e) {
      return true;
    }
  }
  // To cancel previous checks if user keeps typing
  let suggestionCheckAborter = null;

  function renderInstantSuggestions() {
    const inputVal = cekDomainInput.value;
    const {
      base,
      isFullDomain,
      isInvalid
    } = parseDomain(inputVal, allExtensions);
    if (!base || base.length < 2 || isFullDomain || isInvalid) {
      cekDomainSuggestions.style.display = 'none';
      return;
    }
    const topExts = ['.com', '.id', '.co.id', '.web.id', '.my.id'];
    cekDomainSuggestions.innerHTML = '';
    // Abort previous check if still running
    if (suggestionCheckAborter) {
      suggestionCheckAborter.abort();
    }
    suggestionCheckAborter = new AbortController();
    const signal = suggestionCheckAborter.signal;
    topExts.forEach((ext, index) => {
      const fullDomain = `${base}${ext}`;
      const extData = allExtensions.find(item => item.ext === ext);
      const item = document.createElement('div');
      item.className = 'cek-domain-suggestion-item';
      item.setAttribute('role', 'option');
      item.id = `suggestion-${index}`;
      const extSafe = ext;
      const extColor = extData?.color || '#1a1a2e';
      const extLabel = ext.replace('.', '').toUpperCase();
      const priceHTML = extData && extData.newPrice ? `
        <div class="cek-domain-suggestion-price" id="price-${index}" style="display: none;">
          ${extData.oldPrice ? `<span class="cek-domain-suggestion-price-old">${formatCurrency(extData.oldPrice)}</span>` : ''}
          <span class="cek-domain-suggestion-price-new">${formatCurrency(extData.newPrice)}</span>
        </div>
        <div class="cek-domain-suggestion-status" id="status-${index}" style="font-size: 0.85rem; color: #6b7280;">
          <i class="fas fa-spinner fa-spin"></i> Mengecek...
        </div>
      ` : '';
      item.innerHTML = `
        <div class="cek-domain-suggestion-icon" style="background: ${extColor};">${extLabel}</div>
        <div class="cek-domain-suggestion-content">
          <div class="cek-domain-suggestion-domain">${sanitizeHTML(fullDomain).replace(extSafe, `<span style="color: ${extColor}; font-weight: bold;">${extSafe}</span>`)}</div>
          <div class="cek-domain-suggestion-note">${sanitizeHTML(extData?.info || '')}</div>
        </div>
        ${priceHTML}
      `;
      // Start async check for this specific domain
      fastCheckDNS(fullDomain).then(isAvailable => {
        if (signal.aborted) return;
        const statusEl = item.querySelector(`#status-${index}`);
        const priceEl = item.querySelector(`#price-${index}`);
        if (statusEl && priceEl) {
          if (isAvailable) {
            statusEl.style.display = 'none';
            priceEl.style.display = 'block';
            // Only add click listener if available
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
              cekDomainInput.value = fullDomain;
              cekDomainSuggestions.style.display = 'none';
              cekDomainBtn.click();
            });
          } else {
            statusEl.innerHTML = '<span style="color: #ef4444;"><i class="fas fa-times-circle"></i> Tidak Tersedia</span>';
            item.style.opacity = '0.6';
            item.style.cursor = 'not-allowed';
            item.style.backgroundColor = '#f3f4f6';
          }
        }
      });
      cekDomainSuggestions.appendChild(item);
    });
    cekDomainSuggestions.style.display = 'block';
  }

  function validateDomainInput(input) {
    const {
      valid,
      error
    } = validateDomain(input, allExtensions);
    if (!valid) {
      const icon = error.includes('minimal') ? 'fa-info-circle' : 'fa-warning';
      cekDomainError.innerHTML = `<i class="fas ${icon}"></i> ${error}`;
      cekDomainError.style.display = 'block';
      return false;
    }
    cekDomainError.style.display = 'none';
    return true;
  }
  /**
   * Check domain availability via Cloudflare DNS API
   * Returns object with explicit result state
   */
  async function checkDomainAvailability(domain, abortSignal) {
    try {
      // 1. Check internal backend database first (Orders spreadsheet via GAS)
      let backendSaysTaken = false;
      try {
        const backendCheck = await APIClient.checkDomain(domain);
        if (backendCheck && backendCheck.success === false) {
          backendSaysTaken = true;
        } else if (backendCheck && backendCheck.success && backendCheck.data?.available === false) {
          backendSaysTaken = true;
        }
      } catch (backendError) {
        console.warn('[Domain Check] Backend API check failed:', backendError);
      }
      // 2. Check Cloudflare DNS for global availability
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
        headers: {
          'accept': 'application/dns-json'
        },
        signal: abortSignal,
        timeout: 8000
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const dnsAvailable = !data.Answer || data.Answer.length === 0;
      // 3. Determine final state
      if (!dnsAvailable) {
        // Globally registered
        return {
          available: false,
          error: false,
          method: 'dns-check',
          message: 'Domain sudah terdaftar secara global'
        };
      } else if (backendSaysTaken) {
        // Available globally, but already ordered in our DB spreadsheet
        return {
          available: true,
          isOrdered: true,
          error: false,
          method: 'hybrid-check',
          message: 'Domain sedang dipesan orang lain. Siapa cepat dia dapat!'
        };
      } else {
        // Completely available
        return {
          available: true,
          isOrdered: false,
          error: false,
          method: 'hybrid-check',
          message: null
        };
      }
    } catch (error) {
      // Return error state (jangan silent fail)
      const message = error.name === 'AbortError' ? 'Request dibatalkan' : `Gagal mengecek ketersediaan: ${error.message}`;
      return {
        available: null, // Unknown
        isOrdered: false,
        error: true,
        method: 'dns-check',
        message: message
      };
    }
  }
  // ============================================
  // ABORT CONTROLLER STATE
  // ============================================
  let activeAbortController = null;

  function createResultCard(fullDomain, extData, result, isRecommended = false) {
    const card = document.createElement('li');
    const discount = calculateSavings(extData.oldPrice, extData.newPrice);
    if (result.error) {
      // STATE 3: ERROR
      card.className = 'cek-domain-result-card error';
      card.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> ${sanitizeHTML(fullDomain)}</h3>
        <p class="cek-domain-result-error">${result.message}</p>
        <button class="cek-domain-retry-btn" onclick="location.reload()">
          <i class="fas fa-redo"></i> Coba Lagi
        </button>
      `;
    } else if (result.available === true) {
      // STATE 1: AVAILABLE OR ORDERED
      card.className = `cek-domain-result-card available ${isRecommended ? 'super-highlight' : ''} ${result.isOrdered ? 'warning' : ''}`;
      const badges = [];
      if (result.isOrdered) {
        badges.push(`<span class="cek-domain-ext-label" style="background:#f39c12; color:white;"><i class="fas fa-fire"></i> Rebutan</span>`);
      } else {
        if (extData.label) {
          badges.push(`<span class="cek-domain-ext-label">${extData.label}</span>`);
        }
        if (discount > 0) {
          badges.push(`<span class="cek-domain-ext-discount">-${discount}%</span>`);
        }
        if (isRecommended) {
          badges.push(`<span class="cek-domain-recommended-badge"><i class="fas fa-star"></i> Rekomendasi</span>`);
        }
      }
      let infoHtml = sanitizeHTML(extData.info);
      if (result.isOrdered) {
        infoHtml = `<span style="color: #d35400; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> Sedang dipesan orang lain! <strong>checkout now!!</strong> <br> Siapa cepat, dia dapat!!!.</span>`;
      }
      const extColor = extData?.color || '#1a1a2e';
      const coloredDomain = sanitizeHTML(fullDomain).replace(extData.ext, `<span style="color: ${result.isOrdered ? 'inherit' : extColor};">${extData.ext}</span>`);
      card.innerHTML = `
        <div class="cek-domain-result-badges">${badges.join('')}</div>
        <h3 ${result.isOrdered ? 'style="color:#d35400;"' : ''}>
          <i class="${result.isOrdered ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}"></i> <span>${coloredDomain}</span>
        </h3>
        <p class="cek-domain-result-info">${infoHtml}</p>
        ${extData.oldPrice ? `<span class="cek-domain-result-old">${formatCurrency(extData.oldPrice)}</span>` : ''}
        <p class="cek-domain-result-price">
          dari <strong>${formatCurrency(extData.newPrice)}</strong> /tahun
        </p>
        <div class="cek-domain-actions" style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="cek-domain-action-btn cek-domain-buy-btn" data-domain="${encodeURIComponent(fullDomain)}" data-tld="${extData.ext.replace('.', '')}" data-price="${extData.newPrice}" ${result.isOrdered ? 'style="background: #e67e22; border-color: #d35400;"' : ''}>
            <i class="fas fa-lock"></i> Amankan Sekarang
          </button>
          <button class="cek-domain-wishlist-btn" data-domain="${fullDomain}" title="Tambah ke Wishlist" style="flex: 0 0 40px; cursor: pointer; border: 1px solid #ddd; background: #f8f9fa; border-radius: 5px; font-size: 16px; color: #999; transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
            <i class="far fa-heart"></i>
          </button>
        </div>
      `;
    } else if (result.available === false) {
      // STATE 2: UNAVAILABLE
      card.className = 'cek-domain-result-card unavailable';
      card.innerHTML = `
        <h3><i class="fas fa-times-circle"></i> ${sanitizeHTML(fullDomain)}</h3>
        <p class="cek-domain-result-info">Domain sudah diambil / tidak tersedia</p>
        <p style="font-size: 0.85rem; color: #999;">Coba variasi nama lain atau hubungi support kami</p>
      `;
    } else {
      // STATE 0: UNKNOWN (result.available === null)
      card.className = 'cek-domain-result-card unknown';
      card.innerHTML = `
        <h3><i class="fas fa-question-circle"></i> ${sanitizeHTML(fullDomain)}</h3>
        <p class="cek-domain-result-info">Status ketersediaan tidak jelas</p>
        <p style="font-size: 0.85rem; color: #999;">Silakan hubungi support atau lihat detail</p>
        <a href="/cart/" class="cek-domain-action-btn">Lihat Keranjang</a>
      `;
    }
    return card;
  }
  async function displayResults(inputVal) {
    // Hide suggestions dropdown and blur input to prevent UI occlusion
    if (cekDomainSuggestions) {
      cekDomainSuggestions.style.display = 'none';
    }
    if (cekDomainInput) {
      cekDomainInput.blur();
    }
    // Cancel previous request
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();
    cekDomainBtn.disabled = true;
    const originalBtnHTML = cekDomainBtn.innerHTML;
    cekDomainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
    cekDomainResultsList.innerHTML = '';
    cekDomainResults.removeAttribute('hidden');
    cekDomainResults.classList.add('show');
    cekDomainResults.scrollIntoView({
      behavior: 'smooth'
    });
    const {
      base,
      ext,
      isFullDomain,
      isInvalid
    } = parseDomain(inputVal, allExtensions);
    if (isInvalid) {
      cekDomainResultsList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; color: #e74c3c;"><i class="fas fa-exclamation-circle"></i> Format domain tidak valid <p style="font-size: 0.9rem; margin: 5px 0 0;">Contoh benar: namadomain.com, bisnis.id</p></li>';
      cekDomainBtn.disabled = false;
      cekDomainBtn.innerHTML = originalBtnHTML;
      showError('Format Tidak Valid', 'Format domain tidak valid. Contoh: namadomain.com');
      return;
    }
    const targetExts = isFullDomain ? allExtensions.filter(e => e.ext === ext) : allExtensions;
    try {
      const resultCards = await Promise.all(targetExts.map(async (extData) => {
        try {
          const fullDomain = isFullDomain ? base + ext : base + extData.ext;
          const result = await checkDomainAvailability(fullDomain, activeAbortController.signal);
          return {
            fullDomain,
            extData,
            result,
            available: result.available
          };
        } catch (err) {
          // Catch AbortError too
          if (err.name === 'AbortError') return null;
          return {
            fullDomain: base + extData.ext,
            extData,
            result: {
              error: true,
              message: 'Error checking domain',
              available: null
            },
            available: null
          };
        }
      }));
      // Filter out cancelled requests
      const validResults = resultCards.filter(r => r !== null);
      if (!validResults.length) {
        cekDomainBtn.disabled = false;
        cekDomainBtn.innerHTML = originalBtnHTML;
        return;
      }
      cekDomainResultsList.innerHTML = '';
      // ========== ADVANCED RECOMMENDATION ENGINE ==========
      let recommendedResult = null;
      if (!isFullDomain) {
        // 2. Deteksi Niat Berdasarkan Input User
        let detectedIntent = null;
        for (const intent of DOMAIN_INTENTS) {
          if (intent.regex.test(base)) {
            detectedIntent = intent;
            break;
          }
        }
        // 3. Temukan Rekomendasi Domain Berdasarkan Niat
        if (detectedIntent) {
          for (const ext of detectedIntent.priorities) {
            const match = validResults.find(r => r.available === true && r.extData.ext === ext);
            if (match) {
              recommendedResult = match;
              break;
            }
          }
        }
        // 4. Fallback: Jika tidak terdeteksi niat, gunakan ranking default (Best/Cheap)
        if (!recommendedResult) {
          recommendedResult = validResults.find(r => r.available === true && r.extData.highlight === 'best') || validResults.find(r => r.available === true && r.extData.highlight === 'cheap') || validResults.find(r => r.available === true);
        }
      } else {
        recommendedResult = validResults[0];
      }
      // ========== RENDER RESULTS ==========
      // Recommended card first
      if (recommendedResult) {
        const card = createResultCard(recommendedResult.fullDomain, recommendedResult.extData, recommendedResult.result, true);
        cekDomainResultsList.appendChild(card);
      }
      // Rest of results
      validResults.forEach((item) => {
        if (item !== recommendedResult) {
          const card = createResultCard(item.fullDomain, item.extData, item.result, false);
          cekDomainResultsList.appendChild(card);
        }
      });
      // Add disclaimer
      const disclaimerLi = document.createElement('li');
      disclaimerLi.className = 'cek-domain-disclaimer';
      disclaimerLi.style.gridColumn = '1 / -1';
      disclaimerLi.innerHTML = '<i class="fas fa-info-circle"></i> <small>Ketersediaan dicek secara <em>real-time</em>. Status final akan dikonfirmasi saat checkout. <strong>Garansi uang kembali 100%</strong> jika domain pilihan Anda keduluan didaftarkan orang lain.</small>';
      cekDomainResultsList.appendChild(disclaimerLi);
      // Show success notification
      const availableCount = validResults.filter(r => r.available === true).length;
      if (availableCount > 0) {
        showSuccess('Pengecekan Selesai!', availableCount + ' domain tersedia untuk Anda.');
      } else {
        showInfo('Pengecekan Selesai', 'Pengecekan selesai. Silakan coba dengan nama domain lain.');
      }
    } catch (err) {
      console.error('Display results error:', err);
      cekDomainResultsList.innerHTML = '<li style="grid-column: 1/-1; text-align: center;"><i class="fas fa-exclamation-triangle"></i> Terjadi kesalahan: ' + err.message + '</li>';
      showError('Gagal Mengecek Domain', 'Terjadi kesalahan: ' + err.message);
    } finally {
      cekDomainBtn.disabled = false;
      cekDomainBtn.innerHTML = originalBtnHTML;
    }
  }
  // ============================================
  // EVENT LISTENERS & INITIALIZATION
  // ============================================
  const debouncedSuggestions = debounce(() => renderInstantSuggestions(), 300);
  // Initialize immediately
  renderPricingPreview();
  initiatePlaceholderAnimation();
  cekDomainInput.addEventListener('input', (e) => {
    let value = e.target.value;
    if (value !== value.toLowerCase()) {
      e.target.value = value.toLowerCase();
      value = value.toLowerCase();
    }
    if (/[^a-z0-9.-]/i.test(value)) {
      cekDomainError.innerHTML = '<i class="fas fa-warning"></i> Hanya huruf, angka, titik, dan strip yang diperbolehkan';
      cekDomainError.style.display = 'block';
      intentBadge.classList.remove('visible');
    } else {
      cekDomainError.style.display = 'none';
      debouncedSuggestions();
      // Update intent badge
      const parsed = parseDomain(value, allExtensions);
      const baseVal = parsed.base || value;
      let matchedIntent = null;
      if (baseVal.length > 2 && !parsed.isFullDomain) {
        for (const intent of DOMAIN_INTENTS) {
          if (intent.regex.test(baseVal)) {
            matchedIntent = intent;
            break;
          }
        }
      }
      if (matchedIntent) {
        intentBadge.innerHTML = '<i class="fas fa-lightbulb"></i> Kategori <strong>' + matchedIntent.name + '</strong> terdeteksi. Sebaiknya gunakan <strong>' + matchedIntent.priorities[0] + '</strong>';
        intentBadge.classList.add('visible');
      } else {
        intentBadge.classList.remove('visible');
      }
    }
  });
  cekDomainInput.addEventListener('blur', () => {
    setTimeout(() => {
      cekDomainSuggestions.style.display = 'none';
    }, 200);
  });
  cekDomainForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = cekDomainInput.value.trim();
    if (validateDomainInput(input)) {
      await displayResults(input);
    } else {
      cekDomainError.style.display = 'block';
    }
  });
  cekDomainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      cekDomainBtn.click();
    }
  });
  // ============================================
  // DOMAIN PURCHASE & WISHLIST HANDLERS
  // ============================================
  section.addEventListener('click', async (e) => {
    // Handle "Amankan Sekarang" button
    if (e.target.closest('.cek-domain-buy-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.cek-domain-buy-btn');
      const domain = decodeURIComponent(btn.dataset.domain);
      const tld = btn.dataset.tld;
      const price = parseInt(btn.dataset.price) || 0;
      try {
        const {
          DOMAIN_PACKAGES
        } = await import('../config/api.config.js');
        // Add domain to cart for both guest and authenticated users
        CartManager.add(domain, tld, {
          package: 'starter',
          duration: 1,
          price: DOMAIN_PACKAGES.starter.price,
          renewalPrice: DOMAIN_PACKAGES.starter.price,
          basePrice: DOMAIN_PACKAGES.starter.price
        });
        // ALL users (guest or authenticated) → Cart page directly
        window.location.href = '/cart/';
      } catch (error) {
        showError('❌ Gagal', error.message);
      }
    }
    // Handle Wishlist heart button
    if (e.target.closest('.cek-domain-wishlist-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.cek-domain-wishlist-btn');
      const domain = btn.dataset.domain;
      const heartIcon = btn.querySelector('i');
      try {
        if (WishlistManager.isInWishlist(domain)) {
          // Remove from wishlist
          WishlistManager.remove(domain);
          heartIcon.className = 'far fa-heart';
          btn.style.color = '#999';
          showSuccess('❤️ Dihapus', `${domain} dihapus dari wishlist`);
        } else {
          // Add to wishlist
          WishlistManager.add(domain, 'Domain impian', 'medium');
          heartIcon.className = 'fas fa-heart';
          btn.style.color = '#e74c3c';
        }
      } catch (error) {
        showError('❌ Error', error.message);
      }
    }
    // Close autocomplete if clicking elsewhere
    if (!cekDomainForm.contains(e.target) && !cekDomainSuggestions.contains(e.target)) {
      cekDomainSuggestions.innerHTML = '';
    }
  });
  // Update wishlist heart icons on page load
  document.addEventListener('cart:updated', () => {
    updateWishlistIcons();
  });
  document.addEventListener('wishlist:updated', () => {
    updateWishlistIcons();
  });

  function updateWishlistIcons() {
    const wishlistBtns = section.querySelectorAll('.cek-domain-wishlist-btn');
    wishlistBtns.forEach(btn => {
      const domain = btn.dataset.domain;
      const heartIcon = btn.querySelector('i');
      if (WishlistManager.isInWishlist(domain)) {
        heartIcon.className = 'fas fa-heart';
        btn.style.color = '#e74c3c';
      } else {
        heartIcon.className = 'far fa-heart';
        btn.style.color = '#999';
      }
    });
  }
  // ============================================
  // AUTO-SEARCH FROM URL PARAMS
  // ============================================
  const urlParams = new URLSearchParams(window.location.search);
  const autoSearchQuery = urlParams.get('q');
  if (autoSearchQuery && cekDomainInput) {
    // If the user came from dashboard or other places with ?q=domain
    cekDomainInput.value = autoSearchQuery;
    // Auto trigger search after a small delay to let UI settle
    setTimeout(() => {
      // Scroll to section smoothly
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Dispatch submit event on the form to trigger the existing listener
      const submitEvent = new Event('submit', {
        cancelable: true,
        bubbles: true
      });
      cekDomainForm.dispatchEvent(submitEvent);
    }, 500);
  }
})();