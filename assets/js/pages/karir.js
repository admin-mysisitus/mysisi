/* ========== KARIR PAGE INTERACTIONS ========== */
/* Halaman lowongan karir dengan job card interactions, process timeline, dan benefit animations */
/* Sistem animasi yang smooth dan optimal tanpa konflik */

class KarirPageManager {
  constructor() {
    this.config = {
      animationDuration: 0.6,
      animationDelay: 0.08,
      isTouch: this.detectTouchDevice(),
      threshold: 0.1,
      debounceDelay: 250
    };

    this.state = {
      expandedJobs: new Set(),
      elementsObserved: new WeakSet()
    };

    this.observer = null;
    this.init();
  }

  // ========== INITIALIZATION ==========
  init() {
    this.injectOptimizedAnimationStyles();
    this.setupRevealAnimations();
    this.setupBenefitItems();
    this.setupJobCards();
    this.setupProcessSteps();
    this.setupCultureItems();
    this.setupCtaButtons();
  }

  // ========== TOUCH DETECTION ==========
  detectTouchDevice() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }

  // ========== INTERSECTION OBSERVER FACTORY ==========
  createObserver(callback, options = {}) {
    return new IntersectionObserver(callback, {
      threshold: options.threshold || this.config.threshold,
      rootMargin: options.rootMargin || '0px'
    });
  }

  // ========== REVEAL ANIMATIONS WITH STAGGERING ==========
  setupRevealAnimations() {
    const elementGroups = [
      { selector: '.benefit-item', delay: 0.08 },
      { selector: '.job-card', delay: 0.1 },
      { selector: '.process-step', delay: 0.08 },
      { selector: '.culture-item', delay: 0.08 }
    ];

    elementGroups.forEach(({ selector, delay }) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;

      const observer = this.createObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.state.elementsObserved.has(entry.target)) {
            this.state.elementsObserved.add(entry.target);
            const index = Array.from(elements).indexOf(entry.target);
            const staggerDelay = index * delay;
            
            // Gunakan CSS class untuk animasi, bukan inline style
            entry.target.style.setProperty('--animation-delay', `${staggerDelay}s`);
            entry.target.classList.add('animate-in');
            
            observer.unobserve(entry.target);
          }
        });
      });

      elements.forEach((el) => observer.observe(el));
    });
  }

  // ========== BENEFIT ITEMS ==========
  setupBenefitItems() {
    const benefitItems = document.querySelectorAll('.benefit-item');
    if (benefitItems.length === 0) return;

    benefitItems.forEach((item) => {
      if (!this.config.isTouch) {
        item.addEventListener('mouseenter', () => item.classList.add('hover-active'));
        item.addEventListener('mouseleave', () => item.classList.remove('hover-active'));
      }
    });
  }

  // ========== JOB CARDS ==========
  setupJobCards() {
    const jobCards = document.querySelectorAll('.job-card');
    if (jobCards.length === 0) return;

    // Desktop hover
    if (!this.config.isTouch) {
      jobCards.forEach((card) => {
        card.addEventListener('mouseenter', () => card.classList.add('hover-active'));
        card.addEventListener('mouseleave', () => card.classList.remove('hover-active'));
      });
    }

    // Mobile expand/collapse
    this.setupJobToggle();
    this.setupApplyButtons();
  }

  setupJobToggle() {
    const jobHeaders = document.querySelectorAll('.job-header');
    jobHeaders.forEach((header) => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.btn')) return;

        const card = header.closest('.job-card');
        const body = card.querySelector('.job-body');
        const jobTitle = card.querySelector('.job-title');

        if (body) {
          const isHidden = body.classList.toggle('hidden');
          this.updateJobToggleState(card, !isHidden, jobTitle?.textContent.trim());
        }
      });
    });
  }

  updateJobToggleState(card, isExpanded, jobTitle) {
    if (isExpanded) {
      this.state.expandedJobs.add(jobTitle);
    } else {
      this.state.expandedJobs.delete(jobTitle);
    }
  }

  setupApplyButtons() {
    const applyButtons = document.querySelectorAll('.job-card .btn-sm');
    applyButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const jobCard = btn.closest('.job-card');
        const jobTitle = jobCard.querySelector('.job-title')?.textContent.trim();
        
        if (jobTitle) {
          // Create URL with job position and auto-submit flag
          const params = new URLSearchParams({
            tipe: 'karir',
            posisi: jobTitle.toLowerCase().replace(/\s+/g, '-'),
            auto: 'true'  // Flag untuk auto-submit (akan menampilkan form dengan auto-prefill)
          });
          
          // Redirect ke halaman kontak dengan parameter
          window.location.href = `/kontak/?${params.toString()}`;
        }
      });
    });
  }

  // ========== PROCESS STEPS ==========
  setupProcessSteps() {
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length === 0) return;

    if (!this.config.isTouch) {
      processSteps.forEach((step) => {
        step.addEventListener('mouseenter', () => step.classList.add('hover-active'));
        step.addEventListener('mouseleave', () => step.classList.remove('hover-active'));
      });
    }
  }

  // ========== CULTURE ITEMS ==========
  setupCultureItems() {
    const cultureItems = document.querySelectorAll('.culture-item');
    if (cultureItems.length === 0) return;

    if (!this.config.isTouch) {
      cultureItems.forEach((item) => {
        item.addEventListener('mouseenter', () => item.classList.add('hover-active'));
        item.addEventListener('mouseleave', () => item.classList.remove('hover-active'));
      });
    }
  }

  // ========== CTA BUTTONS ==========
  setupCtaButtons() {
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    if (ctaButtons.length === 0) return;

    ctaButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => this.createRippleEffect(e, btn));

      if (!this.config.isTouch) {
        btn.addEventListener('mouseenter', () => btn.classList.add('hover-active'));
        btn.addEventListener('mouseleave', () => btn.classList.remove('hover-active'));
      }
    });
  }

  // ========== RIPPLE EFFECT ==========
  createRippleEffect(event, button) {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      animation: ripple-animate 0.6s ease-out;
      pointer-events: none;
      transform: translate(-50%, -50%);
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  // ========== OPTIMIZED STYLE INJECTION ==========
  injectOptimizedAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ========== SMOOTH ANIMATION FRAMEWORK ========== */
      
      /* Keyframe Animations */
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(25px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInHorizontal {
        from {
          opacity: 0;
          width: 0;
        }
        to {
          opacity: 1;
          width: 60px;
        }
      }

      @keyframes ripple-animate {
        to {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }

      /* Initial State - Elements hidden until animation */
      .benefit-item,
      .job-card,
      .process-step,
      .culture-item {
        opacity: 0;
        transform: translateY(20px);
      }

      /* Reveal Animation Class */
      .benefit-item.animate-in,
      .job-card.animate-in,
      .process-step.animate-in,
      .culture-item.animate-in {
        animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) var(--animation-delay, 0s) forwards;
      }

      /* Section Divider Animation */
      .section-divider {
        animation: slideInHorizontal 0.6s ease-out 0.3s forwards;
      }

      /* Smooth Hover States */
      .benefit-item {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .benefit-item.hover-active {
        transform: translateY(-6px);
      }

      .benefit-item.hover-active .benefit-icon {
        transform: scale(1.12) rotate(8deg);
      }

      .benefit-icon {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      /* Job Card Hover */
      .job-card {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .job-card.hover-active {
        transform: translateY(-5px);
      }

      /* Process Step Hover */
      .process-step {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .process-step .step-number {
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .process-step.hover-active .step-number {
        transform: scale(1.2);
      }

      /* Culture Item Hover */
      .culture-item {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .culture-item.hover-active {
        transform: translateY(-6px);
      }

      .culture-icon {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .culture-item.hover-active .culture-icon {
        transform: scale(1.18) rotate(-8deg);
      }

      /* CTA Button Hover */
      .karir-cta-section .btn {
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .karir-cta-section .btn.hover-active {
        transform: translateY(-4px) scale(1.05);
      }

      /* Job Body Toggle */
      .job-body {
        transition: all 0.3s ease;
      }

      .job-body.hidden {
        display: none;
      }

      .job-header {
        cursor: pointer;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }
}

// ========== INITIALIZATION ON DOM READY ==========
document.addEventListener('DOMContentLoaded', () => {
  new KarirPageManager();
});
