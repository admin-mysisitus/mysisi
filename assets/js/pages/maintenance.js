/* ========== MAINTENANCE PAGE INTERACTIONS ========== */
/* Detail halaman maintenance dengan service levels dan monitoring */

document.addEventListener('DOMContentLoaded', function () {
  // ========== PROBLEM ITEMS HOVER ANIMATION ==========
  const problemItems = document.querySelectorAll('.problem-item');
  
  problemItems.forEach(item => {
    const icon = item.querySelector('i');
    
    if (icon && !isTouch()) {
      item.addEventListener('mouseenter', function () {
        icon.style.animation = 'none';
        setTimeout(() => {
          icon.style.animation = 'iconRotate 0.6s ease-in-out';
        }, 10);
      });
    }
  });

  // ========== SERVICE CATEGORY INTERACTION ==========
  const serviceCategories = document.querySelectorAll('.service-category');
  
  serviceCategories.forEach(category => {
    const items = category.querySelectorAll('li');
    
    items.forEach((item, index) => {
      item.style.animation = `slideInUp 0.6s ease-out ${0.1 + index * 0.05}s forwards`;
      item.style.opacity = '0';
    });
  });

  // ========== INCLUDED ITEMS HOVER ==========
  const includedItems = document.querySelectorAll('.included-item');
  
  includedItems.forEach(item => {
    const icon = item.querySelector('i');
    
    if (icon && !isTouch()) {
      item.addEventListener('mouseenter', function () {
        icon.style.transform = 'scale(1.2) rotate(15deg)';
      });
      
      item.addEventListener('mouseleave', function () {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
    }
  });

  // ========== SERVICE LEVEL SELECTOR ==========
  const serviceLevels = document.querySelectorAll('[data-service-level], .package-card');
  
  serviceLevels.forEach(level => {
    const selectButton = level.querySelector('.btn, [data-select]');
    
    if (selectButton) {
      selectButton.addEventListener('click', function (e) {
        const levelName = level.querySelector('h3')?.textContent || 'Unknown Level';
        const levelPrice = level.querySelector('.price')?.textContent || 'Custom';
        
        sessionStorage.setItem('selectedServiceLevel', levelName);
        sessionStorage.setItem('maintenancePrice', levelPrice);
        
        // Update visual
        serviceLevels.forEach(l => l.classList.remove('selected'));
        level.classList.add('selected');
        
        // Show features breakdown
        showFeaturesBreakdown(levelName);
      });
    }
  });

  function showFeaturesBreakdown(level) {
    const breakdownElement = document.querySelector('[data-features-breakdown]');
    
    if (breakdownElement) {
      const featureMap = {
        'Maintenance Ringan': ['Pergantian gambar banner & produk', 'Revisi teks & kalimat', 'Koreksi typo & font', 'Waktu pengerjaan cepat'],
        'Maintenance Sedang': ['Update konten sedang (hingga 5 item)', 'Penambahan section/bagian baru sederhana', 'Optimasi tata letak UI/UX minor', 'Pembenahan link rusak & error ringan'],
        'Maintenance Besar': ['Refactor kode & peningkatan performa', 'Penambahan fitur custom (Form, API)', 'Perombakan UI/UX ekstensif', 'Perbaikan bug & error sistem kompleks']
      };

      const features = featureMap[level] || [];
      breakdownElement.innerHTML = features.map(f => `<li>✓ ${f}</li>`).join('');
    }
  }

  // ========== UPTIME MONITOR ==========
  const uptimeMonitor = document.querySelector('[data-uptime-monitor]');
  
  if (uptimeMonitor) {
    // Simulated uptime data
    const uptime = 99.95;
    const lastIncident = '15 hari yang lalu';
    
    uptimeMonitor.innerHTML = `
      <div style="padding: 1rem;">
        <p><strong>Uptime Bulan Ini:</strong> ${uptime}%</p>
        <p><strong>Incident Terakhir:</strong> ${lastIncident}</p>
      </div>
    `;
  }

  // ========== MAINTENANCE SCHEDULE DISPLAY ==========
  const scheduleDisplay = document.querySelector('[data-maintenance-schedule]');
  
  if (scheduleDisplay) {
    const schedule = {
      backup: 'Setiap hari pada jam 02:00 WIB',
      updates: 'Setiap minggu (opsional dapat dijadwalkan)',
      optimization: 'Sesuai kebutuhan'
    };

    let html = '<ul>';
    for (const [item, time] of Object.entries(schedule)) {
      html += `<li><strong>${item}:</strong> ${time}</li>`;
    }
    html += '</ul>';
    
    scheduleDisplay.innerHTML = html;
  }

  // ========== COMPARISON TABLE ROW ANIMATION ==========
  const comparisonRows = document.querySelectorAll('.comparison-table tbody tr, [data-comparison-row]');
  
  comparisonRows.forEach((row, index) => {
    row.style.animation = `slideInUp 0.4s ease-out ${index * 0.05}s both`;
  });

  // ========== COMPARISON TABLE HOVER HIGHLIGHT ==========
  comparisonRows.forEach(row => {
    row.addEventListener('mouseenter', function () {
      this.style.backgroundColor = '#E0F2FE';
    });
    
    row.addEventListener('mouseleave', function () {
      const isEven = Array.from(comparisonRows).indexOf(this) % 2 === 1;
      this.style.backgroundColor = isEven ? '#F9FAFB' : '#FFFFFF';
    });
  });

  // ========== ADD-ON SERVICES ==========
  const addonButtons = document.querySelectorAll('[data-addon], .addon-btn');
  
  addonButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      
      this.classList.toggle('added');
      
      const addonName = this.getAttribute('data-addon') || this.textContent;
      const isAdded = this.classList.contains('added');
      
      if (isAdded) {
        this.innerHTML = '<i class="fas fa-check"></i> Ditambahkan';
      } else {
        this.innerHTML = '<i class="fas fa-plus"></i> Tambahkan';
      }
    });
  });

  // ========== CONTACT FOR CUSTOM PLAN ==========
  const customPlanButton = document.querySelector('[data-custom-plan]');
  
  if (customPlanButton) {
    customPlanButton.addEventListener('click', function () {
      const contactForm = document.querySelector('form[data-contact], .contact-form');
      
      if (contactForm) {
        contactForm.scrollIntoView({ behavior: 'smooth' });
        
        // Pre-fill form if possible
        const messageField = contactForm.querySelector('textarea[name="message"], [data-message]');
        if (messageField) {
          messageField.value = 'Saya tertarik dengan custom maintenance plan.';
        }
      }
    });
  }

  // ========== FAQ ACCORDION INTERACTIONS ==========
  // FAQ functionality is now handled by faq.js component

  // ========== CTA BUTTONS INTERACTIONS ==========
  const ctaButtons = document.querySelectorAll('.detail-cta-section .btn');
  
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const btnText = this.textContent;
      
      // Add ripple effect (desktop only)
      if (!isTouch()) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    });
  });

  // ========== AUTO SCROLL SLIDERS (SERUPA HALAMAN PERUSAHAAN) ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;

    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;

    let track = sliderElement.firstElementChild;
    if (track && (track.classList.contains('problem-item') || track.classList.contains('package-card'))) {
      track = sliderElement;
    }

    if (!track || track.children.length === 0) return;

    const scrollToNext = () => {
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;

      // Jangan jalankan animasi jika kontennya muat (tidak ada scrollbar horizontal), contoh: mode desktop
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

  // Inisialisasi slider untuk mobile
  initAutoSnapSlider(document.querySelector('.problems-grid'));
  initAutoSnapSlider(document.querySelector('.packages-grid'));

  function isTouch() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }

});
