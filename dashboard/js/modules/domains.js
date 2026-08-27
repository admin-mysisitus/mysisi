/**
 * Domains Page Module
 * Manage registered domains, renewal, DNS settings
 * MVP Status: ✅ COMPLETE - Shows list of registered domains
 * Future Enhancement: Add DNS management, renewal, domain settings
 */
import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  openDnsManagement
} from '/assets/js/modules/dns-ui.js';
import {
  CartManager
} from '/assets/js/modules/unified-cart.js';
import {
  showInfo,
  showSuccess,
  showError
} from '/assets/js/modules/unified-utils.js';
export async function render(currentUser) {
  try {
    // Load user orders to get registered domains
    const result = await APIClient.getUserOrders(currentUser.userId);
    const orders = result.data?.orders || result.orders || [];
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const domainMap = {};
    // Sort by date so registeredDate is the oldest order's date
    paidOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    paidOrders.forEach(o => {
      const dur = parseInt(o.domainDuration) || 1;
      if (!domainMap[o.domain]) {
        domainMap[o.domain] = {
          name: o.domain,
          registeredDate: o.createdAt,
          totalDuration: dur,
          orderId: o.orderId
        };
      } else {
        domainMap[o.domain].totalDuration += dur;
      }
    });
    const domains = Object.values(domainMap).map(d => ({
      name: d.name,
      registeredDate: d.registeredDate,
      expiryDate: calculateExpiryDate(d.registeredDate, d.totalDuration),
      status: getDomainStatus(d.registeredDate, d.totalDuration),
      orderId: d.orderId
    }));
    const container = document.getElementById('domains-list-container');
    if (!container) return;
    if (domains.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada domain terdaftar.</p>
          <a href="#!/dashboard/checkout" class="btn btn-primary">Daftar Domain Baru</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="domain-grid">
          ${domains.map(dom => `
            <div class="invoice-mobile-card domain-list-card">
              <div class="inv-card-header">
                <div class="inv-card-id" style="text-transform: lowercase;">${dom.name}</div>
                <div class="inv-card-status badge-${dom.status.class}">${dom.status.text}</div>
              </div>
              <div class="inv-card-body">
                <div class="inv-card-row">
                  <span class="inv-card-label">Terdaftar</span>
                  <span class="inv-card-value">${formatDate(dom.registeredDate)}</span>
                </div>
                <div class="inv-card-row">
                  <span class="inv-card-label">Kadaluarsa</span>
                  <span class="inv-card-value">${formatDate(dom.expiryDate)}</span>
                </div>
              </div>
              <div class="inv-card-footer">
                <button class="btn btn-sm btn-outline btn-dns btn-full" data-domain="${dom.name}">
                  <i class="ph ph-gear"></i> Kelola DNS
                </button>
                <button class="btn btn-sm btn-primary btn-renew btn-full" data-domain="${dom.name}">
                  <i class="ph ph-arrows-clockwise"></i> Perpanjang
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      // Attach modern event listeners instead of using inline onclick with global fallback
      container.querySelectorAll('.btn-dns').forEach(btn => {
        btn.addEventListener('click', () => {
          const domainName = btn.dataset.domain;
          handleDNSManagement(domainName);
        });
      });
      container.querySelectorAll('.btn-renew').forEach(btn => {
        btn.addEventListener('click', async () => {
          const domainName = btn.dataset.domain;
          const domainInfo = domains.find(d => d.name === domainName);
          await handleDomainRenewal(domainName, domainInfo?.expiryDate);
        });
      });
    }
  } catch (error) {
    console.error('Error rendering domains:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">${error.message}</div>
    `;
  }
}

function calculateExpiryDate(createdDate, years = 1) {
  const date = new Date(createdDate);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

function getDomainStatus(createdDate, years = 1) {
  const expiryDate = calculateExpiryDate(createdDate, years);
  const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) {
    return {
      text: 'Kadaluarsa',
      class: 'danger'
    };
  } else if (daysUntilExpiry < 30) {
    return {
      text: `Segera Kadaluarsa (${daysUntilExpiry} hari)`,
      class: 'warning'
    };
  } else {
    return {
      text: 'Aktif',
      class: 'active'
    };
  }
}
async function handleDomainRenewal(domainName, expiryDate) {
  try {
    showInfo('Memproses', 'Mengambil informasi harga perpanjangan...');
    const tld = domainName.split('.').slice(1).join('.');
    // Fetch pricing
    const configRes = await APIClient.fetchPricingConfig();
    let renewalPrice = 150000; // Fallback price
    if (configRes.success && configRes.data && configRes.data.domains) {
      const extData = Object.values(configRes.data.domains).find(d => d.ext === tld || d.ext === `.${tld}`);
      if (extData) {
        renewalPrice = extData.renewal || extData.registration || 150000;
      }
    }
    Swal.close(); // Tutup loading dialog
    // Hitung sisa hari
    const expDate = expiryDate ? new Date(expiryDate) : new Date();
    const daysRemaining = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
    let badgeText = daysRemaining > 0 ? `Expiring in ${daysRemaining} days` : `Expired ${Math.abs(daysRemaining)} days ago`;
    let badgeColor = daysRemaining > 30 ? '#d1fae5' : '#fee2e2';
    let badgeTextColor = daysRemaining > 30 ? '#065f46' : '#991b1b';
    let optionsHtml = '';
    for (let i = 1; i <= 10; i++) {
      const priceFmt = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(renewalPrice * i);
      optionsHtml += `<option value="${i}">${i} Year/s @ ${priceFmt}</option>`;
    }
    const formattedDate = formatDate(expDate);
    const yearsFromNow = (expDate.getFullYear() - new Date().getFullYear());
    const yearsText = yearsFromNow > 0 ? `(${yearsFromNow} year from now)` : (yearsFromNow < 0 ? `(${Math.abs(yearsFromNow)} year ago)` : '');
    if (typeof Swal !== 'undefined') {
      const {
        value: selectedYears,
        isConfirmed
      } = await Swal.fire({
        title: 'Domain Renewal',
        html: `
          <div style="text-align: left; padding: 15px; border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h2 style="margin: 0; font-size: 20px; color: #1f2937;">${domainName}</h2>
              <span style="background: ${badgeColor}; color: ${badgeTextColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${badgeText}</span>
            </div>
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Expiry Date: ${formattedDate} ${yearsText}</p>
            
            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 5px; color: #374151;">Available Renewal Periods</label>
            <select id="renewal-duration" class="swal2-select" style="display: flex; width: 100%; margin: 0; font-size: 15px;">
              ${optionsHtml}
            </select>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add to Cart',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#4f46e5',
        preConfirm: () => {
          return document.getElementById('renewal-duration').value;
        }
      });
      if (isConfirmed && selectedYears) {
        const duration = parseInt(selectedYears);
        CartManager.add(domainName, tld, {
          isRenewal: true,
          duration: duration,
          price: renewalPrice, // Base price per year
          basePrice: renewalPrice,
          renewalPrice: renewalPrice,
          package: 'none',
          packagePrice: 0,
          addons: []
        });
        Swal.fire({
          title: 'Berhasil!',
          text: `${domainName} (Perpanjangan ${duration} Tahun) telah ditambahkan ke keranjang.`,
          icon: 'success',
          confirmButtonText: 'Ke Keranjang',
          showCancelButton: true,
          cancelButtonText: 'Tutup'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.hash = '#!/dashboard/keranjang';
          }
        });
      }
    }
  } catch (error) {
    showError('Gagal', 'Terjadi kesalahan saat memproses perpanjangan: ' + error.message);
  }
}
async function handleDNSManagement(domainName) {
  openDnsManagement(domainName, null);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}