import { menuData, mainServicesData, footerSocialData, footerContactData } from '../config.js';

const navElements = {
  btn: document.getElementById('nav-mobile-btn'),
  menu: document.getElementById('nav-mobile'),
  header: document.querySelector('header'),
  desktopNav: document.querySelector('.nav-desktop')
};

// Generate Menu Desktop
const generateDesktopMenu = () => {
  const list = document.createElement('ul');
  list.className = 'nav-desktop-list';
  menuData.forEach(item => {
    const li = document.createElement('li');
    li.className = `nav-desktop-item ${item.dropdown ? 'nav-desktop-dropdown' : ''} ${item.isPromo ? 'nav-desktop-promo' : ''}`;
    const link = document.createElement('a');
    link.className = `nav-desktop-link ${item.isPromo ? 'promo-link' : ''}`;
    link.href = item.href;
    
    // Tamahkan icon jika ada
    if (item.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'nav-icon';
      iconSpan.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i>`;
      link.appendChild(iconSpan);
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'nav-text';
    textSpan.textContent = item.text;
    link.appendChild(textSpan);
    
    if (item.dropdown) link.setAttribute('aria-haspopup', 'true');
    li.appendChild(link);
    if (item.dropdown) {
      const dropdownMenu = document.createElement('ul');
      dropdownMenu.className = 'nav-desktop-dropdown-menu';
      item.dropdown.forEach(sub => {
        const subLi = document.createElement('li');
        const subLink = document.createElement('a');
        subLink.className = `dropdown-item ${sub.isParent ? 'dropdown-parent' : ''}`;
        subLink.href = sub.href;
        
        // Tambahkan icon untuk dropdown item jika ada
        if (sub.icon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'dropdown-icon';
          iconSpan.innerHTML = `<i class="${sub.icon}" aria-hidden="true"></i>`;
          subLink.appendChild(iconSpan);
        }
        
        const textSpan = document.createElement('span');
        textSpan.className = 'dropdown-text';
        textSpan.textContent = sub.text;
        subLink.appendChild(textSpan);
        
        subLi.appendChild(subLink);
        dropdownMenu.appendChild(subLi);
      });
      li.appendChild(dropdownMenu);
    }
    list.appendChild(li);
  });
  navElements.desktopNav.appendChild(list);
};

// Generate Menu Mobile
const generateMobileMenu = () => {
  const list = document.createElement('ul');
  list.className = 'nav-mobile-list';
  menuData.forEach(item => {
    const li = document.createElement('li');
    li.className = `nav-mobile-item ${item.dropdown ? 'nav-mobile-dropdown' : ''} ${item.isPromo ? 'nav-mobile-promo' : ''}`;
    if (item.dropdown) {
      const header = document.createElement('div');
      header.className = 'nav-mobile-dropdown-header';
      const mainLink = document.createElement('a');
      mainLink.className = 'nav-mobile-link';
      mainLink.href = item.dropdown.find(sub => sub.isParent).href;
      
      // Tambahkan icon di mobile menu
      if (item.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'nav-icon';
        iconSpan.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i>`;
        mainLink.appendChild(iconSpan);
      }
      
      const textSpan = document.createElement('span');
      textSpan.className = 'nav-text';
      textSpan.textContent = item.dropdown.find(sub => sub.isParent).text;
      mainLink.appendChild(textSpan);
      
      const toggle = document.createElement('button');
      toggle.className = 'nav-mobile-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', `Buka submenu ${item.text}`);
      toggle.innerHTML = '<i class="fas fa-chevron-down" aria-hidden="true"></i>';
      header.appendChild(mainLink);
      header.appendChild(toggle);
      li.appendChild(header);
      const dropdownMenu = document.createElement('ul');
      dropdownMenu.className = 'nav-mobile-dropdown-menu';
      item.dropdown.filter(sub => !sub.isParent).forEach(sub => {
        const subLi = document.createElement('li');
        const subLink = document.createElement('a');
        subLink.className = 'nav-mobile-dropdown-link';
        subLink.href = sub.href;
        
        // Tambahkan icon untuk mobile dropdown item jika ada
        if (sub.icon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'dropdown-icon';
          iconSpan.innerHTML = `<i class="${sub.icon}" aria-hidden="true"></i>`;
          subLink.appendChild(iconSpan);
        }
        
        const textSpan = document.createElement('span');
        textSpan.className = 'dropdown-text';
        textSpan.textContent = sub.text;
        subLink.appendChild(textSpan);
        
        subLi.appendChild(subLink);
        dropdownMenu.appendChild(subLi);
      });
      li.appendChild(dropdownMenu);
    } else {
      const link = document.createElement('a');
      link.className = `nav-mobile-link ${item.isPromo ? 'promo-link' : ''}`;
      link.href = item.href;
      
      // Tambahkan icon untuk menu tanpa dropdown
      if (item.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'nav-icon';
        iconSpan.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i>`;
        link.appendChild(iconSpan);
      }
      
      const textSpan = document.createElement('span');
      textSpan.className = 'nav-text';
      textSpan.textContent = item.text;
      link.appendChild(textSpan);
      
      li.appendChild(link);
    }
    list.appendChild(li);
  });
  navElements.menu.appendChild(list);
};

// Setup Dropdown Mobile
const setupMobileDropdowns = () => {
  document.querySelectorAll('.nav-mobile-dropdown .nav-mobile-toggle').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const menu = toggle.closest('.nav-mobile-dropdown').querySelector('.nav-mobile-dropdown-menu');
      const icon = toggle.querySelector('.fas');
      const isActive = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isActive));
      icon.classList.toggle('rotate-180');
      document.querySelectorAll('.nav-mobile-dropdown-menu').forEach(m => {
        if (m !== menu) {
          m.classList.remove('active');
          const siblingToggle = m.closest('.nav-mobile-dropdown').querySelector('.nav-mobile-toggle');
          siblingToggle?.setAttribute('aria-expanded', 'false');
          siblingToggle?.querySelector('.fas')?.classList.remove('rotate-180');
        }
      });
    });
  });
};

// Toggle Menu Mobile
const toggleMobileMenu = () => {
  const isOpen = navElements.menu.classList.contains('active');
  navElements.menu.classList.toggle('active');
  navElements.btn.classList.toggle('active');
  navElements.btn.setAttribute('aria-expanded', String(!isOpen));
  navElements.menu.setAttribute('aria-hidden', String(isOpen));
  document.body.style.overflow = isOpen ? 'auto' : 'hidden';
};

// Set Active Link
const setActiveLinks = () => {
  const currentPath = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('header nav a').forEach(link => {
    const rawHref = link.getAttribute('href');
    if (!rawHref) return;
    const linkPath = rawHref.replace(/\/$/, '') || '/';
    const currentSegments = currentPath.split('/').filter(Boolean);
    const linkSegments = linkPath.split('/').filter(Boolean);
    const isActive = linkPath === '/' ? currentPath === '/' : currentSegments[0] === linkSegments[0] && (currentPath === linkPath || currentPath.startsWith(linkPath + '/'));
    if (isActive) {
      link.classList.add('active');
      if (currentPath === linkPath && link.offsetParent !== null) link.setAttribute('aria-current', 'page');
      const parentDropdown = link.closest('.nav-desktop-dropdown, .nav-mobile-dropdown');
      if (parentDropdown) {
        const parentToggle = parentDropdown.querySelector('.nav-mobile-toggle') || parentDropdown.querySelector(':scope > a');
        parentToggle?.classList.add('active');
        if (currentPath.startsWith(linkPath + '/')) parentToggle?.setAttribute('aria-expanded', 'true');
      }
    }
  });
  document.querySelectorAll('.nav-mobile-dropdown-menu .active').forEach(activeLink => {
    const menu = activeLink.closest('.nav-mobile-dropdown-menu');
    if (menu) {
      menu.classList.add('active');
      const toggle = menu.closest('.nav-mobile-dropdown').querySelector('.nav-mobile-toggle');
      toggle?.querySelector('.fas')?.classList.add('rotate-180');
      toggle?.setAttribute('aria-expanded', 'true');
    }
  });
};

// Generate Footer Link Cepat
const generateFooterLinks = () => {
  const container = document.getElementById('footer-quick-links');
  if (!container) return;
  menuData.filter(item => !item.isPromo).forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.text;
    li.appendChild(a);
    container.appendChild(li);
  });
};

// Generate Footer Layanan Utama
const generateFooterServices = () => {
  const container = document.getElementById('footer-main-services');
  if (!container) return;
  mainServicesData.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.text;
    li.appendChild(a);
    container.appendChild(li);
  });
};

// Generate Footer Sosmed
const generateFooterSocial = () => {
  const container = document.getElementById('footer-sosmed-container');
  if (!container) return;
  footerSocialData.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.setAttribute('aria-label', item.ariaLabel);
    a.setAttribute('target', '_blank');
    a.innerHTML = `<i class="${item.icon}"></i>`;
    container.appendChild(a);
  });
};

// Generate Footer Kontak
const generateFooterContact = () => {
  const container = document.getElementById('footer-kontak-container');
  if (!container) return;
  footerContactData.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i><span>${item.text}</span>`;
    container.appendChild(li);
  });
};

// Auto-hide Header Handler
let lastScrollTop = 0;
let isHideActive = false;
let scrollWithinThreshold = false;

const handleAutoHideHeader = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollThreshold = 100; // Mulai hide setelah scroll 100px
  const triggerDistance = 50; // Distance untuk trigger show/hide

  // Jika masih dalam threshold awal, tampilkan header
  if (scrollTop <= scrollThreshold) {
    navElements.header?.classList.remove('nav-hidden');
    isHideActive = false;
    scrollWithinThreshold = true;
    return;
  }

  scrollWithinThreshold = false;

  // Menentukan arah scroll
  const isScrollingDown = scrollTop > lastScrollTop;

  // Hide header ketika scroll down
  if (isScrollingDown && scrollTop > lastScrollTop + triggerDistance && !isHideActive) {
    navElements.header?.classList.add('nav-hidden');
    isHideActive = true;
  }
  // Show header ketika scroll up
  else if (!isScrollingDown && scrollTop < lastScrollTop - triggerDistance && isHideActive) {
    navElements.header?.classList.remove('nav-hidden');
    isHideActive = false;
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
};

// Inisialisasi Semua Fungsi
document.addEventListener('DOMContentLoaded', () => {
  generateDesktopMenu();
  generateMobileMenu();
  navElements.menu?.classList.remove('active');
  navElements.menu?.setAttribute('aria-hidden', 'true');
  navElements.btn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = 'auto';
  setActiveLinks();
  setupMobileDropdowns();
  navElements.btn?.addEventListener('click', toggleMobileMenu);
  window.addEventListener('click', e => {
    if (navElements.menu.classList.contains('active') && !e.target.closest('.nav-mobile') && !e.target.closest('.nav-mobile-btn')) toggleMobileMenu();
  });
  window.addEventListener('keydown', e => {
    if (navElements.menu.classList.contains('active') && e.key === 'Escape') toggleMobileMenu();
  });
  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 50;
    navElements.header?.classList.toggle('scroll', isScrolled);
    document.body.classList.toggle('header-scroll', isScrolled);
    
    // Panggil auto-hide header handler
    handleAutoHideHeader();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && navElements.menu.classList.contains('active')) toggleMobileMenu();
  });
  generateFooterLinks();
  generateFooterServices();
  generateFooterSocial();
  generateFooterContact();
});
