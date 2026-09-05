class FAQComponent {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.faq-section');
    this.singleOpen = options.singleOpen !== false; // Default: hanya 1 FAQ bisa buka
    this.animationDelay = options.animationDelay || 100;
    if (this.container) {
      this.init();
    }
  }
  init() {
    const faqItems = this.container.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
      item.style.setProperty('--item-delay', `${this.animationDelay * index}ms`);
      const summary = item.querySelector('.faq-question');
      if (summary) {
        summary.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleItem(item, faqItems);
        });
        summary.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleItem(item, faqItems);
          }
        });
      }
    });
  }
  toggleItem(item, allItems) {
    const isOpen = item.hasAttribute('open');
    if (this.singleOpen && !isOpen) {
      allItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.removeAttribute('open');
        }
      });
    }
    if (isOpen) {
      item.removeAttribute('open');
    } else {
      item.setAttribute('open', '');
    }
  }
  openItem(index) {
    const items = this.container.querySelectorAll('.faq-item');
    if (items[index]) {
      const allItems = Array.from(items);
      this.toggleItem(items[index], allItems);
    }
  }
  closeAll() {
    const items = this.container.querySelectorAll('.faq-item');
    items.forEach(item => item.removeAttribute('open'));
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const faqSections = document.querySelectorAll('.faq-section');
  faqSections.forEach(section => {
    new FAQComponent({
      container: section
    });
  });
});