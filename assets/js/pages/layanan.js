document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.layanan-tab-btn');
  const tabPanes = document.querySelectorAll('.layanan-tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const targetId = this.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
  const stepBtns = document.querySelectorAll('.step-btn');
  const stepPanes = document.querySelectorAll('.step-pane');
  const stepperNav = document.querySelector('.stepper-nav');
  stepBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      stepBtns.forEach(b => b.classList.remove('active'));
      stepPanes.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      if (stepperNav && window.innerWidth < 768) {
        const scrollLeft = this.offsetLeft - (stepperNav.clientWidth / 2) + (this.clientWidth / 2);
        stepperNav.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
      const targetStep = this.getAttribute('data-step');
      const targetPane = document.getElementById('step-' + targetStep);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const item = this.parentElement;
      const body = item.querySelector('.accordion-body');
      const icon = this.querySelector('.icon-toggle');
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach(accItem => {
        accItem.classList.remove('active');
        const accBody = accItem.querySelector('.accordion-body');
        const accIcon = accItem.querySelector('.icon-toggle');
        if (accBody) accBody.style.display = 'none';
        if (accIcon) accIcon.textContent = '+';
      });
      if (!isActive) {
        item.classList.add('active');
        if (body) body.style.display = 'block';
        if (icon) icon.textContent = '-';
      }
    });
  });
  const ctaButtons = document.querySelectorAll('.cta-buttons .btn, a[href*="whatsapp"], a[href*="email"]');
  ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const text = this.textContent.toLowerCase();
      if (text.includes('whatsapp')) {
        e.preventDefault();
        window.open('https://wa.me/6281215289095?text=Halo, saya tertarik dengan layanan SISITUS', '_blank');
      } else if (text.includes('email')) {
        e.preventDefault();
        window.location.href = 'mailto:hello@sisitus.com?subject=Inquiry%20Layanan%20SISITUS';
      }
    });
  });
});