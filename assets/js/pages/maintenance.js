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
        'Basic': ['Daily backup', 'Weekly updates', 'Email support'],
        'Professional': ['Daily backup', 'Daily updates', '24/7 support', 'Performance monitoring', 'Security scanning'],
        'Premium': ['Hourly backup', 'Real-time updates', 'Priority support', '24/7 monitoring', 'Advanced security', 'Dedicated account manager']
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

  function isTouch() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }

});
