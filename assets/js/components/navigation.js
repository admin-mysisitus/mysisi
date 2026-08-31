import {
  menuData,
  mainServicesData,
  footerQuickLinksData,
  footerLegalData,
  footerSocialData,
  footerContactData,
  footerTrustBadgesData
} from '../config.js';
import {
  normalizeDriveImageUrl,
  withCacheBust,
  renderUserAvatarHtml,
  EnvHelper
} from '../modules/unified-utils.js';
import { AuthManager } from '../modules/unified-auth.js';
import { CartManager, WishlistManager } from '../modules/unified-cart.js';
const navElements = {
  btn: document.getElementById('nav-mobile-btn'),
  menu: document.getElementById('nav-mobile'),
  header: document.querySelector('header'),
  desktopNav: document.querySelector('.nav-desktop')
};

// Helper: Create profile menu item
function createProfileMenuItem(user) {
  const li = document.createElement('li');
  li.className = 'nav-desktop-item nav-desktop-profile';
  const link = document.createElement('a');
  link.className = 'nav-desktop-link profile-link';
  link.href = user?.role === 'admin' ? EnvHelper.getDomainUrl('backstage', '/') : EnvHelper.getDomainUrl('my', '/dashboard/');
  link.innerHTML = renderUserAvatarHtml(user, 'w200', 'nav-profile-photo');
  const span = document.createElement('span');
  span.className = 'nav-profile-name';
  span.textContent = user?.displayName || 'User';
  link.appendChild(span);
  li.appendChild(link);
  return li;
}
// Generate Menu Desktop
const generateDesktopMenu = () => {
  const list = document.createElement('ul');
  list.className = 'nav-desktop-list';
  const loggedInUser = window.SSO_USER || AuthManager.getCurrentUser();
  menuData.forEach(item => {
    // Skip login item if user is logged in
    if (item.isAuth && loggedInUser) {
      return;
    }
    const li = document.createElement('li');
    li.className = `nav-desktop-item ${item.dropdown ? 'nav-desktop-dropdown' : ''} ${item.isPromo ? 'nav-desktop-promo' : ''} ${item.isAuth ? 'nav-desktop-auth' : ''}`;
    const link = document.createElement('a');
    link.className = `nav-desktop-link ${item.isPromo ? 'promo-link' : ''} ${item.isAuth ? 'auth-link' : ''}`;
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
  // Add profile item if user is logged in
  if (loggedInUser) {
    const profileLi = createProfileMenuItem(loggedInUser);
    list.appendChild(profileLi);
  }
  // Only append to desktop nav if element exists (not on auth page)
  if (navElements.desktopNav) {
    navElements.desktopNav.appendChild(list);
  } else {
    console.log('[Navigation] .nav-desktop element not found - skipping desktop menu');
  }
};
// Generate Menu Mobile
const generateMobileMenu = () => {
  const list = document.createElement('ul');
  list.className = 'nav-mobile-list';
  const loggedInUser = window.SSO_USER || AuthManager.getCurrentUser();
  menuData.forEach(item => {
    // Skip login item if user is logged in
    if (item.isAuth && loggedInUser) {
      return;
    }
    const li = document.createElement('li');
    li.className = `nav-mobile-item ${item.dropdown ? 'nav-mobile-dropdown' : ''} ${item.isPromo ? 'nav-mobile-promo' : ''} ${item.isAuth ? 'nav-mobile-auth' : ''}`;
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
      link.className = `nav-mobile-link ${item.isPromo ? 'promo-link' : ''} ${item.isAuth ? 'auth-link' : ''}`;
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
  // Add profile item if user is logged in (mobile version)
  if (loggedInUser) {
    const profileLi = document.createElement('li');
    profileLi.className = 'nav-mobile-item nav-mobile-profile';
    const link = document.createElement('a');
    link.className = 'nav-mobile-link profile-link';
    link.href = loggedInUser?.role === 'admin' ? EnvHelper.getDomainUrl('backstage', '/') : EnvHelper.getDomainUrl('my', '/dashboard/');
    link.innerHTML = renderUserAvatarHtml(loggedInUser, 'w200', 'nav-profile-photo') + `<span class="nav-profile-name">${loggedInUser?.displayName || 'User'}</span>`;
    profileLi.appendChild(link);
    list.appendChild(profileLi);
  }
  // Only append to mobile nav if element exists (not on auth page)
  if (navElements.menu) {
    navElements.menu.appendChild(list);
  } else {
    console.log('[Navigation] #nav-mobile element not found - skipping mobile menu');
  }
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
// footer kolom link cepat — dibaca dari data terpisah, bukan dari menuData
const generateFooterLinks = () => {
  const container = document.getElementById('footer-quick-links');
  if (!container) return;
  footerQuickLinksData.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.text;
    li.appendChild(a);
    container.appendChild(li);
  });
};
// footer baris legal — syarat ketentuan, privasi, refund
const generateFooterLegal = () => {
  const container = document.getElementById('footer-legal-links');
  if (!container) return;
  footerLegalData.forEach(item => {
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
    a.innerHTML = `
      <span class="sosmed-icon">${item.svg || '<i class="' + item.icon + '"></i>'}</span>
      <span class="sosmed-text">${item.name || item.ariaLabel}</span>
    `;
    container.appendChild(a);
  });
};
// Generate Footer Trust Badges
const generateFooterTrustBadges = () => {
  const container = document.getElementById('footer-trust-badges-container');
  if (!container) return;
  container.className = 'footer-trust-badges';
  container.setAttribute('aria-label', 'Sertifikasi dan Keamanan');
  const p = document.createElement('p');
  p.className = 'trust-title';
  p.textContent = 'Terdaftar & Tersertifikasi Oleh:';
  container.appendChild(p);
  const logosDiv = document.createElement('div');
  logosDiv.className = 'trust-logos';
  footerTrustBadgesData.forEach(item => {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.width = 120;
    img.height = 40;
    logosDiv.appendChild(img);
  });
  container.appendChild(logosDiv);
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
// Refresh Navigation - Call this after user login/logout to update navbar
export function refreshNavigation() {
  try {
    // Clear existing desktop menu
    const desktopNav = navElements.desktopNav;
    if (desktopNav) {
      const existingList = desktopNav.querySelector('.nav-desktop-list');
      if (existingList) existingList.remove();
    }
    // Clear existing mobile menu
    const menu = navElements.menu;
    if (menu) {
      const existingList = menu.querySelector('.nav-mobile-list');
      if (existingList) existingList.remove();
    }
    // Re-generate menus with updated user session
    generateDesktopMenu();
    generateMobileMenu();
    // Re-setup interactions
    setActiveLinks();
    setupMobileDropdowns();
  } catch (error) {
    console.log('Error refreshing navigation:', error);
  }
}
// Helper: Get cart item count from localStorage
function getCartItemCount() {
  if (typeof window.SSO_CART_COUNT === 'number') {
    return window.SSO_CART_COUNT;
  }
  try {
    const cart = CartManager.getCart();
    return (cart && cart.domains) ? cart.domains.length : 0;
  } catch (e) {
    return 0;
  }
}
// Update floating cart display based on cart items count
function updateFloatingCart() {
  // Don't show floating cart button on the cart page itself
  const isCartPage = window.location.pathname.includes('/cart/') || window.location.pathname.endsWith('/cart');
  if (isCartPage) {
    const existing = document.getElementById('floating-cart-btn');
    if (existing) existing.remove();
    return;
  }
  const count = getCartItemCount();
  let el = document.getElementById('floating-cart-btn');
  if (count > 0) {
    if (!el) {
      el = document.createElement('a');
      el.id = 'floating-cart-btn';
      el.className = 'floating-cart-btn';
      // Route to Customer Portal if user is logged in via SSO
      el.href = window.SSO_USER ? EnvHelper.getDomainUrl('my', '/dashboard/#!/dashboard/cart') : '/cart/';
      el.innerHTML = `
        <i class="fas fa-shopping-cart" aria-hidden="true"></i>
        <span class="floating-cart-badge">${count}</span>
      `;
      document.body.appendChild(el);
      // Inject floating cart styles if not already present
      if (!document.getElementById('floating-cart-styles')) {
        const styles = document.createElement('style');
        styles.id = 'floating-cart-styles';
        styles.textContent = `
          .floating-cart-btn {
            position: fixed;
            top: 100px;
            right: 24px;
            background: #2563eb;
            color: white;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            text-decoration: none;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid white;
          }
          .floating-cart-btn:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
            background: #1d4ed8;
          }
          .floating-cart-btn i {
            font-size: 20px;
          }
          .floating-cart-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #ef4444;
            color: white;
            font-size: 11px;
            font-weight: 700;
            min-width: 20px;
            height: 20px;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 4px;
            border: 2px solid white;
            animation: floating-cart-pulse 2s infinite;
          }
          @keyframes floating-cart-pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            }
            70% {
              box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            }
          }
        `;
        document.head.appendChild(styles);
      }
    } else {
      const badge = el.querySelector('.floating-cart-badge');
      if (badge) badge.textContent = count;
      el.href = window.SSO_USER ? EnvHelper.getDomainUrl('my', '/dashboard/#!/dashboard/cart') : '/cart/';
    }
  } else {
    if (el) el.remove();
  }
}
// Expose refreshNavigation to window for easy access from other scripts
window.refreshNavigation = refreshNavigation;
// Inisialisasi Semua Fungsi
document.addEventListener('DOMContentLoaded', () => {
  // Check for Reverse Handoff from Dashboard
  const hash = window.location.hash;
  if (hash.startsWith('#handoff=')) {
    try {
      const payload = JSON.parse(atob(hash.replace('#handoff=', '')));
      if (payload.cart) CartManager.mergeCart(payload.cart);
      if (payload.wishlist) WishlistManager.mergeWishlist(payload.wishlist);
      
      // Update User Session for visual UI sync
      if (payload.user !== undefined) {
        if (payload.user) {
          AuthManager.saveSession(payload.user);
        } else {
          AuthManager.clearSession();
        }
        refreshNavigation();
      }

      // Clean URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (err) {
      console.log('[Navigation] Invalid handoff token:', err);
    }
  }

  // Always initialize floating cart
  updateFloatingCart();
  // Listen to cart updates
  window.addEventListener('cart:updated', updateFloatingCart);
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') updateFloatingCart();
  });
  // Skip navigation setup if on auth page (no nav-desktop or nav-mobile elements)
  if (!navElements.desktopNav && !navElements.menu) {
    console.log('[Navigation] Navigation elements not found on this page - skipping initialization (likely auth page)');
    return;
  }
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
    if (navElements.menu && navElements.menu.classList.contains('active') && !e.target.closest('.nav-mobile') && !e.target.closest('.nav-mobile-btn')) toggleMobileMenu();
  });
  window.addEventListener('keydown', e => {
    if (navElements.menu && navElements.menu.classList.contains('active') && e.key === 'Escape') toggleMobileMenu();
  });
  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 50;
    navElements.header?.classList.toggle('scroll', isScrolled);
    document.body.classList.toggle('header-scroll', isScrolled);
    // Panggil auto-hide header handler
    handleAutoHideHeader();
  });
  window.addEventListener('resize', () => {
    if (navElements.menu && window.innerWidth >= 768 && navElements.menu.classList.contains('active')) toggleMobileMenu();
  });
  generateFooterLinks();
  generateFooterServices();
  generateFooterSocial();
  generateFooterContact();
  generateFooterTrustBadges();
  generateFooterLegal();

  // Listen to auth state changes to dynamically update the navigation
  document.addEventListener('auth:authChanged', () => {
    refreshNavigation();
  });

  // Interceptor: Cegat navigasi ke Customer Portal untuk Handoff Guest Cart (Single Door Auth)
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    let href = link.getAttribute('href');
    if (!href) return;

    // Hanya cegat transisi ke auth atau dashboard Customer
    if (href.includes('/auth/') || href.includes('my.sisitus.com/auth') || href.includes('my.sisitus.com/dashboard')) {
      // Jika sudah login, biarkan langsung lewat
      if (window.SSO_USER) return;

      e.preventDefault();

      const cartData = CartManager.getCart();
      
      let wishlistData = null;
      try {
        if (typeof WishlistManager !== 'undefined') {
          wishlistData = WishlistManager.getWishlist();
        } else {
          // Fallback read from localStorage if WishlistManager is not loaded
          const raw = localStorage.getItem('wishlist');
          if (raw) wishlistData = JSON.parse(raw);
        }
      } catch (err) {}

      // Jika tidak ada data yang perlu di-handoff, langsung navigasi
      if (!cartData && !wishlistData) {
        window.location.href = link.href;
        return;
      }

      // Encode payload ke Base64
      try {
        const handoffPayload = { cart: cartData, wishlist: wishlistData };
        const handoffBase64 = btoa(JSON.stringify(handoffPayload));
        
        // Ensure proper redirect structure
        const urlObj = new URL(link.href, window.location.origin);
        
        // Append hash ke URL
        urlObj.hash = `handoff=${handoffBase64}`;
        
        window.location.href = urlObj.toString();
      } catch (err) {
        console.log('Error creating handoff hash:', err);
        window.location.href = link.href;
      }
    }
  });
});
