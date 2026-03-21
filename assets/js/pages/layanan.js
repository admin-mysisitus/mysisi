/* ========== LAYANAN PAGE INTERACTIONS ========== */

document.addEventListener('DOMContentLoaded', function () {
  // ========== SERVICE CARD INTERACTIONS ==========
  const serviceCards = document.querySelectorAll('.layanan-card');
  
  serviceCards.forEach((card, index) => {
    // Add hover effect with smooth transition
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });

    // Intersection observer untuk reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(card);
  });

  // ========== PROCESS FLOW INTERACTION ==========
  const processItems = document.querySelectorAll('.process-item');
  
  processItems.forEach((item, index) => {
    item.addEventListener('mouseenter', function () {
      this.style.borderTop = '3px solid var(--hijau-muda)';
      this.style.boxShadow = 'var(--shadow-elegan)';
    });
    
    item.addEventListener('mouseleave', function () {
      this.style.borderTop = 'none';
      this.style.boxShadow = 'var(--shadow-lembut)';
    });
  });

  // ========== CTA BUTTON INTERACTIONS ==========
  const ctaButtons = document.querySelectorAll('.cta-buttons .btn, a[href*="whatsapp"], a[href*="email"]');
  
  ctaButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      const text = this.textContent.toLowerCase();
      
      if (text.includes('whatsapp')) {
        e.preventDefault();
        // Format: https://wa.me/6281215289095?text=Saya%20tertarik%20dengan%20layanan%20SISITUS
        window.open('https://wa.me/6281215289095?text=Halo, saya tertarik dengan layanan SISITUS', '_blank');
      } else if (text.includes('email')) {
        e.preventDefault();
        window.location.href = 'mailto:sisitus.com@gmail.com?subject=Inquiry%20Layanan%20SISITUS';
      }
    });
  });

  // Navigation handled by browser default behavior
  // Animation handled by CSS Intersection Observer utility (if needed)

  // ========== FEATURE LIST EXPAND (Optional) ==========
  const featureLists = document.querySelectorAll('.layanan-features ul');
  
  featureLists.forEach(list => {
    const items = list.querySelectorAll('li');
    if (items.length > 4) {
      // Limit visible items
      items.forEach((item, index) => {
        if (index > 3) {
          item.style.display = 'none';
        }
      });
      
      // Add expand button
      const expandBtn = document.createElement('button');
      expandBtn.className = 'btn-expand-features';
      expandBtn.textContent = 'Lihat Lebih Banyak ▼';
      expandBtn.style.marginTop = '0.5rem';
      expandBtn.style.padding = '0.4rem 0.8rem';
      expandBtn.style.background = 'transparent';
      expandBtn.style.border = 'none';
      expandBtn.style.color = 'var(--hijau-muda)';
      expandBtn.style.cursor = 'pointer';
      expandBtn.style.fontWeight = '600';
      expandBtn.style.fontSize = 'var(--teks-kecil)';
      expandBtn.style.transition = 'var(--transisi)';
      
      expandBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const isExpanded = this.textContent.includes('Lebih Sedikit');
        
        items.forEach((item, index) => {
          if (index > 3) {
            item.style.display = isExpanded ? 'none' : 'block';
          }
        });
        
        this.textContent = isExpanded ? 'Lihat Lebih Banyak ▼' : 'Lihat Lebih Sedikit ▲';
      });
      
      list.parentNode.appendChild(expandBtn);
    }
  });

});
