/**
 * Dashboard Home Page Module
 */
import APIClient from '/assets/js/modules/unified-api.js';
import {
  formatPrice,
  formatNumber,
  EnvHelper
} from '/assets/js/modules/unified-utils.js';
export async function render(currentUser) {
  if (currentUser && currentUser.role === 'admin') {
    window.location.replace(EnvHelper.getDomainUrl('backstage', '/'));
    return;
  }
  try {
    // Update welcome name dynamically
    let displayName = currentUser.displayName || 'Pelanggan';
    if (displayName && typeof displayName === 'string' && displayName.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(displayName);
        if (parsed.displayName) {
          displayName = parsed.displayName;
        }
      } catch (e) {}
    }
    const welcomeName = document.getElementById('user-welcome-name');
    if (welcomeName) {
      welcomeName.textContent = displayName;
    }
    // Get order statistics from userOrderStats endpoint
    let stats = null;
    try {
      const result = await APIClient.getUserOrderStats(currentUser.userId);
      if (result.success) {
        stats = result.data || {};
        // Update dashboard with statistics
        updateStatisticsDisplay(stats);
      }
    } catch (error) {
      console.log('Statistics not available:', error);
    }
    // Render cart reminder card at the top if cart is not empty
    try {
      const {
        CartManager
      } = await import('/assets/js/modules/unified-cart.js');
      const cartSummary = CartManager.getSummary();
      if (cartSummary.itemCount > 0) {
        const cart = CartManager.getCart();
        const firstItem = cart.domains[0];
        const domainName = firstItem?.domain || '';
        const packageId = firstItem?.package || 'starter';
        const packageName = packageId.charAt(0).toUpperCase() + packageId.slice(1);
        const reminderHTML = `
          <div class="cart-floating-reminder">
            <div class="cart-reminder-content">
              <h3>
                <i class="ph-fill ph-shopping-cart"></i> Pemesanan Anda Belum Selesai!
              </h3>
              <p>
                Anda memiliki domain <strong>${domainName}</strong> (Paket ${packageName}) di keranjang belanja Anda.
              </p>
            </div>
            <a href="#!/dashboard/keranjang" class="cart-reminder-btn">
              Selesaikan Pembayaran <i class="ph-fill ph-arrow-right"></i>
            </a>
          </div>
        `;
        const content = document.getElementById('content');
        if (content) {
          content.insertAdjacentHTML('afterbegin', reminderHTML);
        }
      }
    } catch (cartError) {
      console.log('Error rendering cart reminder card:', cartError);
    }
    // Render dynamic domain pricing
    try {
      const configRes = await APIClient.fetchPricingConfig();
      if (configRes.success && configRes.data && configRes.data.domains) {
        // Map RTDB Object back to Array for rendering
        const pricingData = Object.values(configRes.data.domains).map(d => ({
          ...d,
          ext: `.${d.ext}`
        })).sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999;
          const orderB = typeof b.order === 'number' ? b.order : 999;
          return orderA - orderB;
        });
        const pricingContainer = document.getElementById('dynamic-domain-pricing');
        if (pricingContainer) {
          pricingContainer.innerHTML = pricingData.map(domain => {
            const hasDiscount = domain.oldPrice && domain.oldPrice > domain.registration;
            return `
              <div class="search-pill">
                <span class="ext" style="color: ${domain.color || '#ea4335'};">${domain.ext}</span>
                <div class="pricing-info">
                  ${hasDiscount ? `<span class="original-price">${formatNumber(domain.oldPrice)}</span>` : ''}
                  <span class="current-price">${formatNumber(domain.registration)}</span>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (pricingError) {
      console.log('Error fetching domain pricing:', pricingError);
    }
    // Render dynamic promo block
    try {
      const promoPanel = document.getElementById('dashboard-promo-panel');
      const promoTitle = document.getElementById('dashboard-promo-title');
      const promoDesc = document.getElementById('dashboard-promo-desc');
      if (promoPanel && promoTitle && promoDesc) {
        const promoRes = await APIClient.getPublicPromos();
        if (promoRes.success && promoRes.data && promoRes.data.length > 0) {
          // Find the best percentage discount
          const percentPromos = promoRes.data.filter(p => p.type === 'percentage');
          let bestPercent = 0;
          if (percentPromos.length > 0) {
            bestPercent = Math.max(...percentPromos.map(p => Number(p.value) || 0));
          }
          if (bestPercent > 0) {
            promoTitle.textContent = `Diskon Hingga ${bestPercent}%`;
            promoDesc.textContent = `Klaim berbagai kode voucher aktif kami sekarang juga!`;
          } else {
            // Fallback if there are only fixed discounts
            promoTitle.textContent = `Voucher Spesial Tersedia`;
            promoDesc.textContent = `Dapatkan potongan harga eksklusif untuk layanan kami.`;
          }
        } else {
          // Hide panel if no promos available
          promoPanel.style.display = 'none';
        }
      }
    } catch (promoError) {
      console.log('Error fetching promos for dashboard:', promoError);
      const promoPanel = document.getElementById('dashboard-promo-panel');
      if (promoPanel) promoPanel.style.display = 'none';
    }
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.log('Error rendering dashboard:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">
        ${error.message}
      </div>
    `;
  }
}

function updateStatisticsDisplay(stats) {
  // Update dashboard statistics widgets
  const widgets = {
    'stat-total-orders': stats.totalOrders || 0,
    'stat-total-spent': stats.totalSpent ? formatPrice(stats.totalSpent) : 'Rp 0',
    'stat-average-order': stats.averageOrderValue ? formatPrice(stats.averageOrderValue) : 'Rp 0',
    'stat-active-orders': stats.ordersByStatus?.processing || 0,
    'stat-completed': stats.ordersByStatus?.completed || 0,
    'stat-active-domains': stats.activeDomains || 0
  };
  Object.entries(widgets).forEach(([elementId, value]) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  });
}

function setupEventListeners() {
  // Quick action buttons
  const btnCheckout = document.getElementById('btn-quick-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      window.location.hash = '#!/dashboard/checkout';
    });
  }
  const btnOrders = document.getElementById('btn-quick-orders');
  if (btnOrders) {
    btnOrders.addEventListener('click', () => {
      window.location.hash = '#!/dashboard/orders';
    });
  }
  const btnProfile = document.getElementById('btn-quick-profile');
  if (btnProfile) {
    btnProfile.addEventListener('click', () => {
      window.location.hash = '#!/dashboard/profile';
    });
  }
  const btnSupport = document.getElementById('btn-quick-support');
  if (btnSupport) {
    btnSupport.addEventListener('click', () => {
      window.location.hash = '#!/dashboard/support';
    });
  }
  // Domain search form in dashboard
  const domainForm = document.getElementById('dashboard-domain-form');
  if (domainForm) {
    domainForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = document.getElementById('dashboard-domain-input').value.trim();
      if (query) {
        window.location.href = '../index.html?section=cek-domain&q=' + encodeURIComponent(query);
      }
    });
  }
}