(async function() {
  'use strict';
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
    formatCurrency,
    sanitizeHTML,
    EnvHelper
  } = await import('../modules/unified-utils.js');
  const APIClient = (await import('../modules/unified-api.js')).default;
  const section = document.querySelector('.cek-domain-section');
  if (!section) return;
  const {
    parseDomain,
    validateDomain
  } = await import('../modules/domain-utils.js');
  let allExtensions = [];
  try {
    const configRes = await APIClient.fetchPricingConfig();
    if (configRes.success && configRes.data && configRes.data.domains) {
      allExtensions = Object.values(configRes.data.domains).map(d => ({
        ...d,
        ext: `.${d.ext}`
      })).sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        return orderA - orderB;
      });
    }
  } catch (err) {
    console.log('Failed to load domain pricing from APIClient:', err);
  }

  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
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
  const cekDomainInput = section.querySelector('#cek-domain-input');
  const cekDomainError = section.querySelector('#cek-domain-error');
  const cekDomainBtn = section.querySelector('#cek-domain-btn');
  const cekDomainSuggestions = section.querySelector('#cek-domain-suggestions');
  const cekDomainResultsList = section.querySelector('#cek-domain-results-list');
  const cekDomainResults = section.querySelector('#cek-domain-results');
  const cekDomainForm = section.querySelector('#cek-domain-form-main');
  const cekDomainClearBtn = section.querySelector('#cek-domain-clear-btn');
  const cekDomainPopularExtensions = section.querySelector('#cek-domain-popular-extensions');
  const cekDomainPricingPreview = section.querySelector('.cek-domain-pricing-preview');
  if (!cekDomainInput || !cekDomainForm) return;
  const intentBadge = document.createElement('div');
  intentBadge.className = 'cek-domain-intent-badge';
  cekDomainForm.parentNode.insertBefore(intentBadge, cekDomainForm);

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

  function selectDomainItem(value) {
    cekDomainInput.value = value;
    cekDomainBtn.click();
  }

  function renderPricingPreview() {
    if (!cekDomainPopularExtensions) return;
    cekDomainPopularExtensions.innerHTML = '';
    const sortedExts = [...allExtensions].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      if (orderA !== orderB) return orderA - orderB;
      const order = {
        best: 3,
        cheap: 2,
        business: 1,
        none: 0
      };
      return order[b.highlight] - order[a.highlight];
    }).slice(0, 8);
    sortedExts.forEach((ext, idx) => {
      const discount = calculateSavings(ext.oldPrice, ext.registration);
      const item = document.createElement('div');
      item.className = 'cek-domain-ext-item-simple';
      item.style.animationDelay = `${idx * 0.05}s`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      const extColor = ext.color || '#1a1a2e';
      const extLabel = ext.ext.replace('.', '').toUpperCase();
      const extFilename = `tld-${ext.ext.replace(/\./g, '')}.svg`;
      const fallbackIconHtml = `<span class="cek-domain-fallback-text" style="color: ${extColor}; display: none;">${ext.ext}</span>`;
      let labels = '';
      if (ext.label) {
        labels += `<span class="cek-domain-badge cek-domain-badge--label">${ext.label}</span>`;
      }
      if (discount > 0) {
        labels += `<span class="cek-domain-badge cek-domain-badge--discount">-${discount}%</span>`;
      }
      const badgeGroup = labels ? `<div class="cek-domain-badge-group-simple">${labels}</div>` : '';
      item.innerHTML = `
        <div class="cek-domain-ext-content-simple">
          ${badgeGroup}
          <div class="cek-domain-ext-main-simple">
            <div class="cek-domain-ext-logo-wrap">
              <img src="/assets/img/tld/${extFilename}" alt="${ext.ext}" class="tld-logo" width="60" height="24" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
              ${fallbackIconHtml}
            </div>
            <div class="cek-domain-ext-prices-simple">
              ${ext.oldPrice ? `<span class="cek-domain-ext-old">${formatCurrency(ext.oldPrice)}</span>` : ''}
              <span class="cek-domain-ext-new">${formatCurrency(ext.registration)}</span>
            </div>
          </div>
        </div>
      `;
      const handleSelect = () => {
        const currentInput = cekDomainInput.value;
        const parsed = parseDomain(currentInput, allExtensions);
        const base = parsed.base || '';
        cekDomainInput.value = base + ext.ext;
        cekDomainInput.focus();
        const cursorPosition = base.length;
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
    if (cekDomainPricingPreview) {
      cekDomainPricingPreview.style.display = 'block';
      cekDomainPricingPreview.classList.add('fade-in');
    }
  }
  const domainCheckCache = new Map();
  const availabilityCache = new Map();
  let suggestionCheckAborter = null;

  function renderInstantSuggestions() {
    const inputVal = cekDomainInput.value;
    const {
      base,
      ext,
      isFullDomain,
      isInvalid
    } = parseDomain(inputVal, allExtensions);
    const {
      valid
    } = validateDomain(inputVal, allExtensions);
    if (!valid || !base || base.length < 2) {
      cekDomainSuggestions.style.display = 'none';
      return;
    }
    let topExts = allExtensions.map(e => e.ext);
    if (isFullDomain && ext) {
      topExts = [ext, ...topExts.filter(e => e !== ext)];
    }
    cekDomainSuggestions.innerHTML = '';
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
      const extFilename = `tld-${ext.replace(/\./g, '')}.svg`;
      const fallbackIconHtml = `<div class="cek-domain-suggestion-icon" style="background: ${extColor}; display: none;">${extLabel}</div>`;
      const iconHtml = `<div class="cek-domain-suggestion-icon-wrapper" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <img src="/assets/img/tld/${extFilename}" alt="${ext}" class="tld-logo-suggestion" width="60" height="24" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        ${fallbackIconHtml}
      </div>`;
      const priceHTML = extData && extData.registration ? `
        <div class="cek-domain-suggestion-price" id="price-${index}" style="display: none;">
          ${extData.oldPrice ? `<span class="cek-domain-suggestion-price-old">${formatCurrency(extData.oldPrice)}</span>` : ''}
          <span class="cek-domain-suggestion-price-new">${formatCurrency(extData.registration)}</span>
        </div>
        <div class="cek-domain-suggestion-status" id="status-${index}" style="font-size: 0.85rem; color: #6b7280;">
          <span class="css-spinner" style="border-color: rgba(0,0,0,0.1); border-top-color: var(--color-primary);"></span> Mengecek...
        </div>
      ` : '';
      item.innerHTML = `
        ${iconHtml}
        <div class="cek-domain-suggestion-content">
          <div class="cek-domain-suggestion-domain">${sanitizeHTML(fullDomain).replace(extSafe, `<span style="color: ${extColor}; font-weight: bold;">${extSafe}</span>`)}</div>
          <div class="cek-domain-suggestion-note">${sanitizeHTML(extData?.info || '')}</div>
        </div>
        ${priceHTML}
      `;
      checkDomainAvailability(fullDomain, signal).then(result => {
        if (signal.aborted) return;
        const isAvailable = result.available === true;
        const statusEl = item.querySelector(`#status-${index}`);
        const priceEl = item.querySelector(`#price-${index}`);
        if (statusEl && priceEl) {
          if (isAvailable) {
            statusEl.style.display = 'none';
            priceEl.style.display = 'flex';
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
              cekDomainInput.value = fullDomain;
              cekDomainSuggestions.style.display = 'none';
              cekDomainBtn.click();
            });
          } else if (result.isOrdered) {
            statusEl.innerHTML = '<span style="color: #e67e22;"><i class="fas fa-fire"></i> Rebutan</span>';
            priceEl.style.display = 'flex';
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
      if (cekDomainSuggestions) {
        cekDomainSuggestions.style.display = 'none';
      }
      return false;
    }
    cekDomainError.style.display = 'none';
    return true;
  }
  async function checkDomainAvailability(domain, abortSignal) {
    if (availabilityCache.has(domain)) {
      return availabilityCache.get(domain);
    }
    try {
      let isAvailableGlobally = true;
      let dnsPromise = domainCheckCache.get(domain);
      if (!dnsPromise) {
        dnsPromise = (async () => {
          const [resA, resNS] = await Promise.all([
            fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
              headers: {
                'accept': 'application/dns-json'
              },
              signal: abortSignal,
              timeout: 5000
            }),
            fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=NS`, {
              headers: {
                'accept': 'application/dns-json'
              },
              signal: abortSignal,
              timeout: 5000
            })
          ]);
          if (!resA.ok || !resNS.ok) throw new Error('DNS Query Failed');
          const [dataA, dataNS] = await Promise.all([resA.json(), resNS.json()]);
          const hasA = dataA.Answer && dataA.Answer.length > 0;
          const hasNS = dataNS.Answer && dataNS.Answer.length > 0;
          if (hasA || hasNS) {
            return false;
          } else if (dataA.Status === 3 || dataNS.Status === 3) {
            return true;
          } else {
            return true;
          }
        })();
        domainCheckCache.set(domain, dnsPromise);
      }
      try {
        isAvailableGlobally = await dnsPromise;
      } catch (dnsError) {
        domainCheckCache.delete(domain); // Remove failed cache
        if (dnsError.name === 'AbortError') throw dnsError;
        console.log('Hybrid DNS check failed:', dnsError);
        isAvailableGlobally = false;
      }
      if (!isAvailableGlobally) {
        return {
          available: false,
          error: false,
          method: 'dns-check',
          message: 'Domain sudah terdaftar secara global'
        };
      }
      let backendSaysTaken = false;
      let isOrderedInBackend = false;
      try {
        const backendCheck = await APIClient.checkDomain(domain);
        if (backendCheck && backendCheck.success === true) {
          if (backendCheck.data?.available === false) {
            backendSaysTaken = true;
            isOrderedInBackend = false;
          } else if (backendCheck.data?.isOrdered === true) {
            backendSaysTaken = true;
            isOrderedInBackend = true;
          }
        }
      } catch (backendError) {
        console.log('[Domain Check] Backend API check failed:', backendError);
      }
      const finalResult = {
        available: true,
        isOrdered: backendSaysTaken && isOrderedInBackend,
        error: false,
        method: 'hybrid-check',
        message: backendSaysTaken ? (isOrderedInBackend ? 'Domain sedang dipesan orang lain (Rebutan).' : 'Domain sudah aktif') : null
      };
      if (backendSaysTaken && !isOrderedInBackend) {
        finalResult.available = false;
      }
      availabilityCache.set(domain, finalResult);
      return finalResult;
    } catch (error) {
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
  let activeAbortController = null;

  function createResultCard(fullDomain, extData, result, isRecommended = false) {
    const card = document.createElement('li');
    const discount = calculateSavings(extData.oldPrice, extData.registration);
    if (result.error) {
      card.className = 'cek-domain-result-card error';
      card.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> ${sanitizeHTML(fullDomain)}</h3>
        <p class="cek-domain-result-error">${result.message}</p>
        <button class="cek-domain-retry-btn" onclick="location.reload()">
          <i class="fas fa-redo"></i> Coba Lagi
        </button>
      `;
    } else if (result.available === true) {
      card.className = `cek-domain-result-card available ${isRecommended ? 'super-highlight' : ''} ${result.isOrdered ? 'warning' : ''}`;
      const badges = [];
      if (result.isOrdered) {
        badges.push(`<span class="cek-domain-badge cek-domain-badge--label" style="background:#f39c12; color:white;"><i class="fas fa-fire"></i> Rebutan</span>`);
      } else {
        if (extData.label) {
          badges.push(`<span class="cek-domain-badge cek-domain-badge--label">${extData.label}</span>`);
        }
        if (discount > 0) {
          badges.push(`<span class="cek-domain-badge cek-domain-badge--discount">-${discount}%</span>`);
        }
        if (isRecommended) {
          badges.push(`<span class="cek-domain-recommended-badge cek-domain-badge cek-domain-badge--neutral"><i class="fas fa-star"></i> Rekomendasi</span>`);
        }
      }
      const badgeGroupHtml = badges.length > 0 ? `<div class="cek-domain-badge-group-simple" style="margin-bottom: 6px; display: flex; gap: 4px; flex-wrap: wrap;">${badges.join('')}</div>` : '';
      let infoHtml = sanitizeHTML(extData.info);
      if (result.isOrdered) {
        infoHtml = `<span style="color: #d35400; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> Sedang dipesan orang lain! Cepat amankan!</span>`;
      }
      const extColor = extData?.color || '#1a1a2e';
      const extFilename = `tld-${extData.ext.replace(/\./g, '')}.svg`;
      const fallbackColor = result.isOrdered ? 'inherit' : extColor;
      const coloredDomain = sanitizeHTML(fullDomain).replace(extData.ext, `<span style="color: ${fallbackColor};">${extData.ext}</span>`);
      const extLabel = extData.ext.replace('.', '').toUpperCase();
      const watermarkTag = `
        <img src="/assets/img/tld/${extFilename}" alt="${extData.ext}" class="tld-logo-result" width="60" height="24" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
        <span class="cek-domain-fallback-text" style="color: ${extColor}; display: none;">${extLabel}</span>
      `;
      card.innerHTML = `
        <div class="cek-domain-result-main">
          ${badgeGroupHtml}
          <h3 class="cek-domain-result-title" ${result.isOrdered ? 'style="color:#d35400;"' : ''}>
            <i class="${result.isOrdered ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}" style="color: ${result.isOrdered ? '#d35400' : '#10b981'};"></i> 
            <span>${coloredDomain}</span>
          </h3>
          <p class="cek-domain-result-info">${infoHtml}</p>
        </div>
        <div class="cek-domain-result-side">
          <div class="cek-domain-result-logo">
            ${watermarkTag}
          </div>
          <div class="cek-domain-result-prices">
            ${extData.oldPrice ? `<span class="cek-domain-result-old">${formatCurrency(extData.oldPrice)}</span>` : ''}
            <span class="cek-domain-result-new"><strong>${formatCurrency(extData.registration)}</strong> <small>/tahun perdana</small></span>
          </div>
          <div class="cek-domain-actions">
            <button class="cek-domain-action-btn cek-domain-buy-btn" data-domain="${encodeURIComponent(fullDomain)}" data-tld="${extData.ext.replace('.', '')}" data-price="${extData.registration}" ${result.isOrdered ? 'style="background: #e67e22; border-color: #d35400;"' : ''}>
              ${result.isOrdered ? '<i class="fas fa-shopping-cart"></i> Ke Keranjang' : '<i class="fas fa-cart-plus"></i> Pesan'}
            </button>
            <button class="cek-domain-wishlist-btn" data-domain="${fullDomain}" data-tld="${extData.ext.replace('.', '')}" data-price="${extData.registration}" title="Tambah ke Wishlist">
              <i class="${WishlistManager && WishlistManager.isInWishlist(fullDomain) ? 'fas fa-heart' : 'far fa-heart'}" ${WishlistManager && WishlistManager.isInWishlist(fullDomain) ? 'style="color: #ef4444;"' : ''}></i>
            </button>
          </div>
        </div>
      `;
    } else if (result.available === false) {
      card.className = 'cek-domain-result-card unavailable';
      card.innerHTML = `
        <h3><i class="fas fa-times-circle"></i> ${sanitizeHTML(fullDomain)}</h3>
        <p class="cek-domain-result-info">Domain sudah diambil / tidak tersedia</p>
        <p style="font-size: 0.85rem; color: #999;">Coba variasi nama lain atau hubungi support kami</p>
      `;
    } else {
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
    if (cekDomainSuggestions) {
      cekDomainSuggestions.style.display = 'none';
    }
    if (cekDomainInput) {
      cekDomainInput.blur();
    }
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();
    cekDomainBtn.disabled = true;
    const originalBtnHTML = cekDomainBtn.innerHTML;
    cekDomainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
    cekDomainResultsList.innerHTML = Array(3).fill(`
      <li class="cek-domain-skeleton-card">
        <div class="cek-domain-result-main">
          <div class="skeleton-title skeleton-text"></div>
          <div class="skeleton-subtitle skeleton-text"></div>
        </div>
        <div class="cek-domain-result-side" style="display:flex; flex-direction:column; align-items:flex-end;">
          <div class="skeleton-price skeleton-text"></div>
          <div class="skeleton-btn skeleton-text"></div>
        </div>
      </li>
    `).join('');
    cekDomainResults.removeAttribute('hidden');
    cekDomainResults.classList.add('show');
    cekDomainResults.scrollIntoView({
      behavior: 'smooth'
    });
    const {
      base,
      ext,
      isFullDomain,
      isUnsupportedExt,
      isInvalid
    } = parseDomain(inputVal, allExtensions);
    if (isInvalid) {
      cekDomainResultsList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; color: #e74c3c;"><i class="fas fa-exclamation-circle"></i> Format domain tidak valid <p style="font-size: 0.9rem; margin: 5px 0 0;">Contoh benar: namadomain.com, bisnis.id</p></li>';
      cekDomainBtn.disabled = false;
      cekDomainBtn.innerHTML = originalBtnHTML;
      showError('Format Tidak Valid', 'Format domain tidak valid. Contoh: namadomain.com');
      return;
    }
    let targetExts = allExtensions;
    let effectiveIsFullDomain = isFullDomain;
    let showUnsupportedWarning = false;
    if (isFullDomain) {
      if (isUnsupportedExt) {
        showUnsupportedWarning = true;
        effectiveIsFullDomain = false;
      } else {
        targetExts = allExtensions.filter(e => e.ext === ext);
      }
    }
    try {
      const resultCards = await Promise.all(targetExts.map(async (extData) => {
        try {
          const fullDomain = effectiveIsFullDomain ? base + ext : base + extData.ext;
          const result = await checkDomainAvailability(fullDomain, activeAbortController.signal);
          return {
            fullDomain,
            extData,
            result,
            available: result.available
          };
        } catch (err) {
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
      const validResults = resultCards.filter(r => r !== null);
      if (!validResults.length) {
        cekDomainBtn.disabled = false;
        cekDomainBtn.innerHTML = originalBtnHTML;
        return;
      }
      cekDomainResultsList.innerHTML = '';
      if (showUnsupportedWarning) {
        const warningDiv = document.createElement('div');
        warningDiv.style.gridColumn = '1 / -1';
        warningDiv.style.background = '#fffbeb';
        warningDiv.style.color = '#b45309';
        warningDiv.style.padding = '12px 16px';
        warningDiv.style.borderRadius = '8px';
        warningDiv.style.marginBottom = '16px';
        warningDiv.style.fontSize = '0.95rem';
        warningDiv.style.border = '1px solid #fde68a';
        warningDiv.innerHTML = `<i class="fas fa-info-circle"></i> Maaf, ekstensi <strong>${sanitizeHTML(ext)}</strong> belum didukung. Berikut adalah rekomendasi ekstensi terbaik untuk <strong>${sanitizeHTML(base)}</strong>:`;
        cekDomainResultsList.appendChild(warningDiv);
      }
      let recommendedResult = null;
      if (!effectiveIsFullDomain) {
        let detectedIntent = null;
        for (const intent of DOMAIN_INTENTS) {
          if (intent.regex.test(base)) {
            detectedIntent = intent;
            break;
          }
        }
        if (detectedIntent) {
          for (const ext of detectedIntent.priorities) {
            const match = validResults.find(r => r.available === true && r.extData.ext === ext);
            if (match) {
              recommendedResult = match;
              break;
            }
          }
        }
        if (!recommendedResult) {
          recommendedResult = validResults.find(r => r.available === true && r.extData.highlight === 'best') || validResults.find(r => r.available === true && r.extData.highlight === 'cheap') || validResults.find(r => r.available === true);
        }
      } else {
        recommendedResult = validResults[0];
      }
      if (recommendedResult) {
        const card = createResultCard(recommendedResult.fullDomain, recommendedResult.extData, recommendedResult.result, true);
        cekDomainResultsList.appendChild(card);
      }
      validResults.forEach((item) => {
        if (item !== recommendedResult) {
          const card = createResultCard(item.fullDomain, item.extData, item.result, false);
          cekDomainResultsList.appendChild(card);
        }
      });
      const disclaimerLi = document.createElement('li');
      disclaimerLi.className = 'cek-domain-disclaimer';
      disclaimerLi.style.gridColumn = '1 / -1';
      disclaimerLi.innerHTML = '<i class="fas fa-info-circle"></i> <small>Ketersediaan dicek secara <em>real-time</em> ke Registry pusat. <strong>Harga dapat berubah</strong> untuk domain berstatus <em>Premium</em>. Status final akan dikonfirmasi saat pendaftaran.</small>';
      cekDomainResultsList.appendChild(disclaimerLi);
      const availableCount = validResults.filter(r => r.available === true).length;
      if (availableCount > 0) {
        showSuccess('Pengecekan Selesai!', availableCount + ' domain tersedia untuk Anda.');
      } else {
        showInfo('Pengecekan Selesai', 'Pengecekan selesai. Silakan coba dengan nama domain lain.');
      }
    } catch (err) {
      console.log('Display results error:', err);
      cekDomainResultsList.innerHTML = '<li style="grid-column: 1/-1; text-align: center;"><i class="fas fa-exclamation-triangle"></i> Terjadi kesalahan: ' + err.message + '</li>';
      showError('Gagal Mengecek Domain', 'Terjadi kesalahan: ' + err.message);
    } finally {
      cekDomainBtn.disabled = false;
      cekDomainBtn.innerHTML = originalBtnHTML;
    }
  }
  const debouncedSuggestions = debounce(() => renderInstantSuggestions(), 300);
  renderPricingPreview();
  initiatePlaceholderAnimation();
  if (cekDomainClearBtn) {
    cekDomainClearBtn.addEventListener('click', () => {
      cekDomainInput.value = '';
      cekDomainClearBtn.style.display = 'none';
      if (cekDomainSuggestions) cekDomainSuggestions.style.display = 'none';
      cekDomainInput.focus();
    });
  }
  cekDomainInput.addEventListener('input', (e) => {
    let value = e.target.value;
    if (value !== value.toLowerCase()) {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      e.target.value = value.toLowerCase();
      e.target.setSelectionRange(start, end);
      value = value.toLowerCase();
    }
    if (cekDomainClearBtn) {
      cekDomainClearBtn.style.display = value ? 'flex' : 'none';
    }
    currentFocus = -1;
    if (/[^a-z0-9.-]/i.test(value)) {
      cekDomainError.innerHTML = '<i class="fas fa-warning"></i> Hanya huruf, angka, titik, dan strip yang diperbolehkan';
      cekDomainError.style.display = 'block';
      intentBadge.classList.remove('visible');
      if (cekDomainSuggestions) {
        cekDomainSuggestions.style.display = 'none';
      }
    } else {
      cekDomainError.style.display = 'none';
      debouncedSuggestions();
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
        intentBadge.innerHTML = '<i class="fas fa-lightbulb"></i> <span>Untuk situs web <strong>' + matchedIntent.name + '</strong> sebaiknya gunakan <strong>' + matchedIntent.priorities[0] + '</strong></span>';
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
  let currentFocus = -1;
  cekDomainInput.addEventListener('keydown', (e) => {
    const items = cekDomainSuggestions && cekDomainSuggestions.style.display !== 'none' ? cekDomainSuggestions.querySelectorAll('.cek-domain-suggestion-item') : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      updateKeyboardFocus(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      updateKeyboardFocus(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentFocus > -1 && items.length > 0 && cekDomainSuggestions.style.display !== 'none') {
        items[currentFocus].click();
      } else {
        cekDomainBtn.click();
      }
    }
  });

  function updateKeyboardFocus(items) {
    if (!items || items.length === 0) return;
    items.forEach(item => item.classList.remove('keyboard-focus'));
    if (currentFocus > -1) {
      items[currentFocus].classList.add('keyboard-focus');
      items[currentFocus].scrollIntoView({
        block: 'nearest'
      });
    }
  }
  section.addEventListener('click', async (e) => {
    if (e.target.closest('.cek-domain-buy-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.cek-domain-buy-btn');
      const domain = decodeURIComponent(btn.dataset.domain);
      const tld = btn.dataset.tld;
      const price = parseInt(btn.dataset.price) || 0;
      try {
        const configRes = await APIClient.fetchPricingConfig();
        let starterPrice = 599000;
        if (configRes.success && configRes.data && configRes.data.packages && configRes.data.packages.starter) {
          starterPrice = configRes.data.packages.starter.price;
        }
        if (window.SSO_USER) {
          window.location.href = EnvHelper.getDomainUrl('my', `/dashboard/#!/dashboard/cart?addDomain=${encodeURIComponent(domain)}&tld=${encodeURIComponent(tld)}`);
          return;
        }
        CartManager.add(domain, tld, {
          package: 'starter',
          duration: 1,
          domainPrice: price,
          packagePrice: starterPrice,
          price: starterPrice,
          renewalPrice: starterPrice,
          basePrice: starterPrice
        });
        window.location.href = '/cart/';
      } catch (error) {
        showError('❌ Gagal', error.message);
      }
    }
    if (e.target.closest('.cek-domain-wishlist-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.cek-domain-wishlist-btn');
      const domain = btn.dataset.domain;
      const tld = btn.dataset.tld;
      const price = parseInt(btn.dataset.price) || 0;
      const heartIcon = btn.querySelector('i');
      try {
        if (window.SSO_USER) {
          const iframe = document.getElementById('sisitus-sso-iframe');
          if (iframe && iframe.contentWindow) {
            const isCurrentlyInWishlist = window.SSO_WISHLIST_DOMAINS && window.SSO_WISHLIST_DOMAINS.includes(domain.toLowerCase());
            if (isCurrentlyInWishlist) {
              heartIcon.className = 'far fa-heart';
              btn.style.color = '#999';
              showSuccess('❤️ Dihapus', `${domain} dihapus dari wishlist (Customer Portal)`);
            } else {
              heartIcon.className = 'fas fa-heart';
              btn.style.color = '#e74c3c';
              showSuccess('Ditambahkan ke Wishlist', `${domain} disimpan untuk nanti (Customer Portal)`);
            }
            iframe.contentWindow.postMessage({
              type: 'SISITUS_DELEGATE_WISHLIST_TOGGLE',
              domain: domain
            }, EnvHelper.getDomainUrl('my', ''));
          } else {
            showError('❌ Error', 'SSO Iframe tidak ditemukan untuk delegasi aksi.');
          }
        } else {
          if (WishlistManager.isInWishlist(domain)) {
            WishlistManager.remove(domain);
            heartIcon.className = 'far fa-heart';
            btn.style.color = '#999';
            showSuccess('❤️ Dihapus', `${domain} dihapus dari wishlist`);
          } else {
            WishlistManager.add(domain, 'Domain impian', 'medium', {
              tld: tld,
              price: price,
              domainPrice: price,
              renewalPrice: price,
              basePrice: price
            });
            heartIcon.className = 'fas fa-heart';
            btn.style.color = '#e74c3c';
            showSuccess('Ditambahkan ke Wishlist', `${domain} disimpan untuk nanti`);
          }
        }
      } catch (error) {
        showError('❌ Error', error.message);
      }
    }
    if (!cekDomainForm.contains(e.target) && !cekDomainSuggestions.contains(e.target)) {
      cekDomainSuggestions.innerHTML = '';
    }
  });
  document.addEventListener('cart:updated', () => {
    updateWishlistIcons();
  });
  document.addEventListener('wishlist:updated', () => {
    updateWishlistIcons();
  });
  window.addEventListener('sso_wishlist:updated', () => {
    updateWishlistIcons();
  });

  function updateWishlistIcons() {
    const wishlistBtns = section.querySelectorAll('.cek-domain-wishlist-btn');
    wishlistBtns.forEach(btn => {
      const domain = btn.dataset.domain;
      const heartIcon = btn.querySelector('i');
      let inWishlist = false;
      if (window.SSO_USER && window.SSO_WISHLIST_DOMAINS) {
        inWishlist = window.SSO_WISHLIST_DOMAINS.includes(domain.toLowerCase());
      } else {
        inWishlist = WishlistManager.isInWishlist(domain);
      }
      if (inWishlist) {
        heartIcon.className = 'fas fa-heart';
        btn.style.color = '#e74c3c';
      } else {
        heartIcon.className = 'far fa-heart';
        btn.style.color = '#999';
      }
    });
  }
  const urlParams = new URLSearchParams(window.location.search);
  const autoSearchQuery = urlParams.get('q');
  if (autoSearchQuery && cekDomainInput) {
    cekDomainInput.value = autoSearchQuery;
    setTimeout(() => {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      const submitEvent = new Event('submit', {
        cancelable: true,
        bubbles: true
      });
      cekDomainForm.dispatchEvent(submitEvent);
    }, 500);
  }
})();